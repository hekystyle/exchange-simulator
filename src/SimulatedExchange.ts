import { Inject } from '@nestjs/common';
import dayjs, { Dayjs } from 'dayjs';
import { Observable, Subject } from 'rxjs';
import { Accounts } from './Accounts.js';
import { Markets } from './Markets.js';
import { Orders } from './Orders.js';
import type { Candle } from './data.js';

export interface Exchange {
  accounts: Accounts;
  orders: Orders;
  markets: Markets;
  onTick(): Observable<[Exchange, Date]>;
  onSimulationFinishing(): Observable<Exchange>;
  onSimulationFinished(): Observable<[Exchange, Date]>;
}

export class SimulatedExchange implements Exchange {
  #onTick = new Subject<[Exchange, Date]>();

  #onSimulationFinishing = new Subject<Exchange>();

  #onSimulationFinished = new Subject<[Exchange, Date]>();

  constructor(
    @Inject(Accounts)
    public readonly accounts: Accounts,
    @Inject(Markets)
    public readonly markets: Markets,
    @Inject(Orders)
    public readonly orders: Orders,
  ) {}

  onTick(): Observable<[Exchange, Date]> {
    return this.#onTick.asObservable();
  }

  onSimulationFinishing(): Observable<Exchange> {
    return this.#onSimulationFinishing.asObservable();
  }

  onSimulationFinished(): Observable<[Exchange, Date]> {
    return this.#onSimulationFinished.asObservable();
  }

  simulate({ candles, pair }: { candles: Candle[]; pair: 'BTCEUR' }) {
    const market = this.markets.get(pair);

    const lastDate = candles.reduce<Dayjs>((_, candle) => {
      const date = dayjs(candle.date);

      this.#onTick.next([this, date.toDate()]);

      market.open(candle.open, date.toDate());

      market.changePrice(candle.high);

      market.changePrice(candle.low);

      market.changePrice(candle.close);

      market.close();

      return date;
    }, dayjs());

    this.#onSimulationFinishing.next(this);

    this.orders.cancelAll();

    this.#onSimulationFinished.next([this, lastDate.add(1, 'day').toDate()]);
  }
}
