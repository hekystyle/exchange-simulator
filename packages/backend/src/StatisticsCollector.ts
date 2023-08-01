import { Metadata, Serie, compactPoint } from '@exchange-simulator/common';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Decimal } from 'decimal.js';
import stableJsonStringify from 'json-stable-stringify';
import { TickEvent, SimulatedExchange } from './SimulatedExchange.js';

export class StatisticsCollector {
  #series = new Map<string, Serie>();

  constructor(
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.setup();
  }

  setup(): this {
    const handler = (event: TickEvent) => {
      const { sender, date } = event;

      Array.from(sender.accounts).forEach(({ wallets, owner }) => {
        Array.from(wallets).forEach(wallet => {
          const { currency, balance } = wallet;
          this.#getOrCreateSerie({ owner, unit: currency, source: 'wallet' }).data.push(
            compactPoint({
              x: date.getTime(),
              y: balance,
            }),
          );

          const reservedBalanceInOpenedOrders = Array.from(sender.orders)
            .filter(order => order.sellingWallet === wallet && order.status === 'open')
            .reduce((acc, order) => {
              return Decimal.add(acc, order.config.sellingAmount);
            }, new Decimal(0))
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

    this.eventEmitter.on(SimulatedExchange.TICK, handler);
    this.eventEmitter.on(SimulatedExchange.SIMULATION_FINISHED, handler);
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
