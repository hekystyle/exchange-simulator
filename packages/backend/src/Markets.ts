import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Market } from './Market.js';

export class Markets implements Iterable<Market> {
  #markets = new Map<string, Market>();

  constructor(
    @Inject(EventEmitter2)
    eventEmitter: EventEmitter2,
  ) {
    this.#markets.set('BTCEUR', new Market(eventEmitter, 'BTCEUR'));
  }

  [Symbol.iterator](): Iterator<Market> {
    return this.#markets.values();
  }

  get(pair: string): Market {
    const market = this.#markets.get(pair);
    if (!market) throw new Error(`Market not found for ${pair}`);
    return market;
  }
}
