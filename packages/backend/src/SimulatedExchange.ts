/* eslint-disable max-classes-per-file */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { Candle } from './candle.js';
import { Event } from './Event.js';
import { Markets } from './Markets.js';
import { Orders } from './Orders.js';
import { StrategyDCA } from './StrategyDCA.js';
import { StrategyEnhancedDCA } from './StrategyEnhancedDCA.js';
import { wait } from './utils/wait.js';

interface Session {
  candles: Candle[];
  pair: 'BTCEUR';
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
    @Inject(StrategyDCA)
    private readonly strategyDCA: StrategyDCA,
    @Inject(StrategyEnhancedDCA)
    private readonly strategyEnhancedDCA: StrategyEnhancedDCA,
    private readonly db: PrismaClient,
  ) {}

  async init(session: Session) {
    if (this.session) throw new Error('Simulation already initialized');
    this.strategyDCA.setup();
    this.strategyEnhancedDCA.setup(1);
    this.session = session;
  }

  async start(slowDownInMs: number | undefined) {
    if (!this.session) throw new Error('Simulation must be started first');
    if (this.abortController) throw new Error('Simulation already started');

    this.abortController = new AbortController();
    const { candles, pair } = this.session;
    const market = this.markets.get(pair);

    let candle = await this.db.candle.findFirst({
      where: {
        pair: 'BTCEUR',
        interval: 3600,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    while (candle) {
      const date = candle.timestamp;

      this.logger.debug(`Simulating ${date.toISOString()}`);

      market.open(candle.open, date);

      market.changePrice(candle.high);

      market.changePrice(candle.low);

      market.changePrice(candle.close);

      market.close();

      this.eventEmitter.emit(TickEvent.ID, new TickEvent(this, candle));

      this.abortController.signal.throwIfAborted();

      // eslint-disable-next-line no-await-in-loop -- it's by design
      if (slowDownInMs) await wait(slowDownInMs);

      this.abortController.signal.throwIfAborted();

      // eslint-disable-next-line no-await-in-loop -- it's by design
      candle = await this.db.candle.findFirst({
        where: {
          pair: 'BTCEUR',
          interval: 3600,
        },
        orderBy: {
          timestamp: 'asc',
        },
        cursor: {
          id: candle.id,
        },
        skip: 1,
      });
    }

    this.eventEmitter.emit(SimulationFinishingEvent.ID, new SimulationFinishingEvent(this));

    this.orders.cancelAll();

    this.eventEmitter.emit(SimulationFinishedEvent.ID, new SimulationFinishedEvent(this));
  }

  stop() {
    if (!this.session) {
      throw new Error('Simulation not started');
    }
    this.abortController?.abort('Simulation stopped by user');
    this.abortController = undefined;
  }
}
