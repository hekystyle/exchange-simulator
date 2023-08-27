import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Market } from './market.js';
import { TradingPair, TradingPairSymbol } from './trading-pair.js';

@Injectable()
export class Markets implements Iterable<Market> {
  #markets = new Map<TradingPairSymbol, Market>();

  constructor(
    @Inject(EventEmitter2)
    eventEmitter: EventEmitter2,
  ) {
    this.#markets.set('BTC-EUR', new Market(eventEmitter, new TradingPair('BTC', 'EUR')));
  }

  [Symbol.iterator](): Iterator<Market> {
    return this.#markets.values();
  }

  get(pair: TradingPairSymbol): Market {
    const market = this.#markets.get(pair);
    if (!market) throw new Error(`Market not found for ${pair}`);
    return market;
  }
}
