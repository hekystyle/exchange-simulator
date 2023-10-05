import {
  Body,
  Controller,
  DefaultValuePipe,
  Logger,
  MessageEvent,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import rx from 'rxjs';
import { z } from 'zod';
import { SimulatedExchange, SimulationFinishedEvent, TickEvent } from './simulated-exchange.js';

@Controller('/simulation')
export class SimulationController {
  private readonly logger = new Logger(SimulationController.name);

  constructor(
    private readonly exchange: SimulatedExchange,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('/init')
  async init(
    @Query('pair', new DefaultValuePipe('BTC-EUR'), new ParseEnumPipe(['BTC-EUR']))
    pair: 'BTC-EUR',
    @Query('interval', new DefaultValuePipe(3600), ParseIntPipe)
    interval: number,
  ) {
    this.logger.debug('Initializing simulation');

    await this.exchange.init({
      pair,
      interval,
    });
  }

  @Post('/start')
  async start(@Body() body: unknown) {
    this.logger.debug('Starting simulation');
    const { speed } = z.object({ speed: z.number().int().positive() }).parse(body);
    await this.exchange.start(speed);
  }

  @Post('/stop')
  stop() {
    this.logger.debug('Stopping simulation');
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
