import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Decimal } from 'decimal.js';
import stableJsonStringify from 'json-stable-stringify';
import { Metadata, Serie, compactPoint } from '@app/common';
import { Accounts } from '../accounts/accounts.js';
import { Orders } from '../orders/orders.js';
import { SimulationFinishedEvent, TickEvent } from '../simulated-exchange.js';

@Injectable()
export class StatisticsCollector {
  #series = new Map<string, Serie>();

  constructor(
    @Inject(Orders)
    private readonly orders: Orders,
    @Inject(Accounts)
    private readonly accounts: Accounts,
  ) {}

  @OnEvent(TickEvent.ID)
  handleSimulationFinishedEvent(event: TickEvent): void {
    this.collectStatisticsForTimePoint(event.candle.timestamp);
  }

  @OnEvent(SimulationFinishedEvent.ID)
  handleTickEvent(): void {
    this.collectStatisticsForTimePoint(new Date());
  }

  getSeries(): Serie[] {
    return Array.from(this.#series.values());
  }

  private collectStatisticsForTimePoint(date: Date) {
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
  }

  #getOrCreateSerie(meta: Metadata): Serie {
    const key = stableJsonStringify(meta);

    const serie = this.#series.get(key) ?? { meta, data: [] };

    this.#series.set(key, serie);

    return serie;
  }
}
