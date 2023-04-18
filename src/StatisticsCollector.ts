import { Inject } from '@nestjs/common';
import stableJsonStringify from 'json-stable-stringify';
import { Exchange, SimulatedExchange } from './SimulatedExchange.js';

type X = number;
type Y = number;

interface Point {
  x: X;
  y: Y;
}

interface Metadata {
  owner: string;
  currency: string;
}

export interface Serie {
  meta: Metadata;
  data: Point[];
}

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
        wallets.forEach(({ balance, currency }) => {
          this.getOrCreateSerie({ owner, currency }).data.push({ x: date.getTime(), y: balance });
        });
      });
    });
    return this;
  }

  getSeries() {
    return Array.from(this.#series.values());
  }

  private getOrCreateSerie(meta: Metadata): Serie {
    const key = stableJsonStringify(meta);

    const serie = this.#series.get(key) ?? { meta, data: [] };

    this.#series.set(key, serie);

    return serie;
  }
}
