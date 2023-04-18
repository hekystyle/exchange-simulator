import { Inject } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import stableJsonStringify from 'json-stable-stringify';
import { Exchange, SimulatedExchange } from './SimulatedExchange.js';
import type { Metadata, Serie } from '@exchange-simulator/common';

export class StatisticsCollector {
  #series = new Map<string, Serie>();

  constructor(
    @Inject(SimulatedExchange)
    private readonly exchange: Exchange,
  ) {
    this.setup();
  }

  setup(): this {
    this.exchange.on('dayClosed', (sender, date) => {
      Array.from(sender.accounts).forEach(({ wallets, owner }) => {
        wallets.forEach(wallet => {
          const { currency, balance } = wallet;
          this.#getOrCreateSerie({ owner, currency, source: 'wallet' }).data.push({
            x: date.getTime(),
            y: balance,
          });

          const reservedBalanceInOpenedOrders = sender.orders
            .filter(order => order.sellingWallet === wallet && order.status === 'open')
            .reduce((acc, order) => {
              return Decimal.add(acc, order.config.sellingAmount);
            }, new Decimal(0))
            .toNumber();

          this.#getOrCreateSerie({ owner, currency, source: 'orders' }).data.push({
            x: date.getTime(),
            y: reservedBalanceInOpenedOrders,
          });
        });
      });
    });
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
