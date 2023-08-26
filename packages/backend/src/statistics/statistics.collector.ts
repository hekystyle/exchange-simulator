import { Metadata, Serie, compactPoint } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Decimal } from 'decimal.js';
import stableJsonStringify from 'json-stable-stringify';
import { Accounts } from '../accounts/accounts.js';
import { Orders } from '../orders/orders.js';
import { SimulationFinishedEvent, TickEvent } from '../simulated-exchange.js';

@Injectable()
export class StatisticsCollector {
  #series = new Map<string, Serie>();

  constructor(
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
    @Inject(Orders)
    private readonly orders: Orders,
    @Inject(Accounts)
    private readonly accounts: Accounts,
  ) {
    this.setup();
  }

  setup(): this {
    const collectStatisticsForTimePoint = (date: Date) => {
      Array.from(this.accounts).forEach(({ wallets, owner }) => {
        Array.from(wallets).forEach(wallet => {
          const { currency, balance } = wallet;
          this.#getOrCreateSerie({ owner, unit: currency, source: 'wallet' }).data.push(
            compactPoint({
              x: date.getTime(),
              y: balance,
            }),
          );

          const reservedBalanceInOpenedOrders = Array.from(this.orders)
            .filter(order => order.sellingWallet === wallet && order.status === 'open')
            .reduce((acc, order) => acc.plus(order.config.sellingAmount), new Decimal(0))
            .toNumber();

          this.#getOrCreateSerie({ owner, unit: currency, source: 'orders' }).data.push(
            compactPoint({
              x: date.getTime(),
              y: reservedBalanceInOpenedOrders,
            }),
          );
        });
      });
    };

    this.eventEmitter.on(TickEvent.ID, (event: TickEvent) =>
      collectStatisticsForTimePoint(event.candle.date),
    );
    this.eventEmitter.on(SimulationFinishedEvent.ID, () => collectStatisticsForTimePoint(new Date()));
    return this;
  }

  getSeries(): Serie[] {
    return Array.from(this.#series.values());
  }

  #getOrCreateSerie(meta: Metadata): Serie {
    const key = stableJsonStringify(meta);

    const serie = this.#series.get(key) ?? { meta, data: [] };

    this.#series.set(key, serie);

    return serie;
  }
}
