import { Inject } from '@nestjs/common';
import dayjs, { Dayjs } from 'dayjs';
import { Accounts } from './Accounts.js';
import { Markets } from './Markets.js';
import { Orders } from './Orders.js';
import { TypedEventEmitter } from './TypedEventEmitter.js';
import type { Candle } from './data.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Events = {
  tick: [Exchange, Date];
  simulationFinishing: [Exchange];
  simulationFinished: [Exchange, Date];
};

export interface Exchange extends TypedEventEmitter<Events> {
  accounts: Accounts;
  orders: Orders;
  markets: Markets;
}

export class SimulatedExchange extends TypedEventEmitter<Events> implements Exchange {
  constructor(
    @Inject(Accounts)
    public readonly accounts: Accounts,
    @Inject(Markets)
    public readonly markets: Markets,
    @Inject(Orders)
    public readonly orders: Orders,
  ) {
    super();
  }

  simulate({ candles, pair }: { candles: Candle[]; pair: 'BTCEUR' }) {
    const market = this.markets.get(pair);

    const lastDate = candles.reduce<Dayjs>((_, candle) => {
      const date = dayjs(candle.date);

      this.emit('tick', this, date.toDate());

      market.open(candle.open, date.toDate());

      market.changePrice(candle.high);

      market.changePrice(candle.low);

      market.changePrice(candle.close);

      market.close();

      return date;
    }, dayjs());

    this.emit('simulationFinishing', this);

    this.orders.cancelAll();

    this.emit('simulationFinished', this, lastDate.add(1, 'day').toDate());
  }
}
