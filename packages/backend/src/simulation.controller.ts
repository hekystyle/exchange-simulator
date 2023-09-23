import { BadRequestException, Body, Controller, Get, Logger, MessageEvent, Put, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import rx from 'rxjs';
import { z } from 'zod';
import { TradingPairSymbol } from './markets/trading-pair.js';
import { SimulatedExchange, SimulationFinishedEvent, TickEvent } from './simulated-exchange.js';

@Controller('/simulation')
export class SimulationController {
  private readonly logger = new Logger(SimulationController.name);

  constructor(
    private readonly exchange: SimulatedExchange,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  async get() {
    return {
      configured: this.exchange.isConfigured,
    };
  }

  @Put('configure')
  async configure(
    @Body()
    body: unknown,
  ) {
    if (this.exchange.isConfigured) {
      throw new BadRequestException('Cannot configure exchange while running');
    }

    const configDto = z
      .object({
        symbol: z
          .string()
          .refine((val): val is TradingPairSymbol => val.match(/^[A-Z]{3,4}-[A-Z]{3,4}$/) !== null),
        interval: z.number().int().positive(),
        range: z
          .object({
            from: z
              .string()
              .datetime()
              .transform(val => new Date(val)),
            to: z
              .string()
              .datetime()
              .transform(val => new Date(val)),
          })
          .optional(),
      })
      .parse(body);

    await this.exchange.configure(configDto);
  }

  @Put('/start')
  start(@Body() body: unknown) {
    this.logger.debug('Starting simulation');
    if (!this.exchange.isConfigured) {
      throw new BadRequestException('Cannot start exchange without configuration');
    }
    const { speed } = z.object({ speed: z.number().int().positive() }).parse(body);
    this.exchange.start(speed).catch(this.logger.error.bind(this.logger));
  }

  @Put('/stop')
  stop() {
    this.logger.debug('Stopping simulation');
    if (!this.exchange.isConfigured) {
      throw new BadRequestException('Cannot stop exchange without configuration');
    }
    this.exchange.stop();
  }

  @Sse('/sse')
  onFinished(): rx.Observable<MessageEvent> {
    const tick = rx.fromEvent(this.eventEmitter, TickEvent.ID).pipe(
      rx.filter((event): event is TickEvent => event instanceof TickEvent),
      rx.map((event: TickEvent): MessageEvent => ({ data: event.candle, type: TickEvent.ID })),
    );

    const finished = rx.fromEvent(this.eventEmitter, SimulationFinishedEvent.ID).pipe(
      rx.filter((event): event is SimulationFinishedEvent => event instanceof SimulationFinishedEvent),
      rx.map((): MessageEvent => ({ data: {}, type: SimulationFinishedEvent.ID })),
    );

    return rx.merge(tick, finished);
  }
}
