import { Body, Controller, Logger, MessageEvent, Post, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, filter, fromEvent, map, merge } from 'rxjs';
import { z } from 'zod';
import { BTCEUR_YEAR_DAILY_CANDLES } from './data/BTCEUR.js';
import { SimulatedExchange, SimulationFinishedEvent, TickEvent } from './SimulatedExchange.js';

@Controller('/simulation')
export class SimulationController {
  private readonly logger = new Logger(SimulationController.name);

  constructor(private readonly exchange: SimulatedExchange, private readonly eventEmitter: EventEmitter2) {}

  @Post('/init')
  async init() {
    this.logger.debug('Initializing simulation');

    await this.exchange.init({
      pair: 'BTCEUR',
      candles: BTCEUR_YEAR_DAILY_CANDLES,
    });
  }

  @Post('/start')
  start(@Body() body: unknown) {
    this.logger.debug('Starting simulation');
    console.log('🚀 ~ file: simulation.controller.ts:28 ~ SimulationController ~ continue ~ body:', body);
    const { speed } = z.object({ speed: z.number().int().positive() }).parse(body);
    this.exchange.start(speed).catch(this.logger.error.bind(this.logger));
  }

  @Post('/stop')
  stop() {
    this.logger.debug('Stopping simulation');
    this.exchange.stop();
  }

  @Sse('/sse')
  onFinished(): Observable<MessageEvent> {
    const tick = fromEvent(this.eventEmitter, TickEvent.ID).pipe(
      filter((event): event is TickEvent => event instanceof TickEvent),
      map((event: TickEvent): MessageEvent => ({ data: event.candle, type: TickEvent.ID })),
    );

    const finished = fromEvent(this.eventEmitter, SimulationFinishedEvent.ID).pipe(
      filter((event): event is SimulationFinishedEvent => event instanceof SimulationFinishedEvent),
      map((): MessageEvent => ({ data: {}, type: SimulationFinishedEvent.ID })),
    );

    return merge(tick, finished);
  }
}
