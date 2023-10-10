/* eslint-disable max-classes-per-file */
import assert from 'assert';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Candle, PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { Event } from './Event.js';
import { Markets } from './markets/markets.js';
import { TradingPairSymbol } from './markets/trading-pair.js';
import { Orders } from './orders/orders.js';
import { wait } from './utils/wait.js';

interface InitSessionConfig {
  pair: TradingPairSymbol<'BTC', 'EUR'>;
  interval: number;
}

interface Session extends InitSessionConfig {
  candles: Candle[];
}

export class TickEvent extends Event<SimulatedExchange> {
  static ID = 'simulation.tick' as const;

  constructor(
    sender: SimulatedExchange,
    public readonly candle: Candle,
  ) {
    super(sender);
  }
}

export class SimulationFinishingEvent extends Event<SimulatedExchange> {
  static ID = 'simulation.finishing' as const;
}

export class SimulationFinishedEvent extends Event<SimulatedExchange> {
  static ID = 'simulation.finished' as const;
}

@Injectable()
export class SimulatedExchange {
  private readonly logger = new Logger(SimulatedExchange.name);

  private session: Required<Session> | undefined;

  private abortController: AbortController | undefined;

  constructor(
    @Inject(Markets)
    private readonly markets: Markets,
    @Inject(Orders)
    private readonly orders: Orders,
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
    @Inject(PrismaClient)
    private readonly database: PrismaClient,
  ) {}

  get initialized() {
    return !!this.session;
  }

  async init(config: InitSessionConfig) {
    assert(!this.session, 'Simulation already initialized');

    // TODO: implement cursor
    const candles = await this.database.candle.findMany({
      where: {
        symbol: config.pair,
        interval: config.interval,
      },
    });

    assert(candles.length, 'No candles found');

    this.session = { ...config, candles };
  }

  async start(slowDownInMs: number | undefined) {
    assert(this.session, 'Simulation must be started first');
    if (this.abortController) throw new Error('Simulation already started');

    this.abortController = new AbortController();
    const { candles, pair } = this.session;
    const market = this.markets.get(pair);

    let candle = candles.shift();

    while (candle) {
      const date = dayjs(candle.timestamp);

      this.logger.debug(`Simulating ${date.format('YYYY-MM-DD')}`);

      market.open(candle.open, date.toDate());

      market.changePrice(candle.high);

      market.changePrice(candle.low);

      market.changePrice(candle.close);

      market.close();

      this.eventEmitter.emit(TickEvent.ID, new TickEvent(this, candle));

      this.abortController.signal.throwIfAborted();

      // eslint-disable-next-line no-await-in-loop -- it's by design
      if (slowDownInMs) await wait(slowDownInMs);

      this.abortController.signal.throwIfAborted();

      candle = candles.shift();
    }

    this.eventEmitter.emit(SimulationFinishingEvent.ID, new SimulationFinishingEvent(this));

    this.orders.cancelAll();

    this.eventEmitter.emit(SimulationFinishedEvent.ID, new SimulationFinishedEvent(this));
  }

  pause() {
    assert(this.session, 'Simulation not started');

    this.abortController?.abort('Simulation paused by user');
    this.abortController = undefined;
  }
}
