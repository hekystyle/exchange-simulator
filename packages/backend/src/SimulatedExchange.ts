import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs, { Dayjs } from 'dayjs';
import { Accounts } from './Accounts.js';
import { Markets } from './Markets.js';
import { Orders } from './Orders.js';
import type { Candle } from './data/BTCEUR.js';

export class SimulatedExchange {
  static readonly SIMULATION_FINISHED = 'exchange.simulationFinished' as const;

  static readonly SIMULATION_FINISHING = 'exchange.simulationFinishing' as const;

  static readonly TICK = 'exchange.tick' as const;

  constructor(
    @Inject(Accounts)
    public readonly accounts: Accounts,
    @Inject(Markets)
    public readonly markets: Markets,
    @Inject(Orders)
    public readonly orders: Orders,
    @Inject(EventEmitter2)
    public readonly eventEmitter: EventEmitter2,
  ) {}

  simulate({ candles, pair }: { candles: Candle[]; pair: 'BTCEUR' }) {
    const market = this.markets.get(pair);

    const lastDate = candles.reduce<Dayjs>((_, candle) => {
      const date = dayjs(candle.date);

      this.eventEmitter.emit(SimulatedExchange.TICK, [this, date.toDate()]);

      market.open(candle.open, date.toDate());

      market.changePrice(candle.high);

      market.changePrice(candle.low);

      market.changePrice(candle.close);

      market.close();

      return date;
    }, dayjs());

    this.eventEmitter.emit(SimulatedExchange.SIMULATION_FINISHING, this);

    this.orders.cancelAll();

    this.eventEmitter.emit(SimulatedExchange.SIMULATION_FINISHED, [this, lastDate.add(1, 'day').toDate()]);
  }
}
