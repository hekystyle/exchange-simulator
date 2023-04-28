import { Observable } from 'rxjs';
import { Market } from './Market.js';

export class Markets implements Iterable<Market> {
  #markets = new Map<string, Market>();

  constructor() {
    this.#markets.set('BTCEUR', new Market('BTCEUR'));
  }

  [Symbol.iterator](): Iterator<Market> {
    return this.#markets.values();
  }

  onPriceChanged(): Observable<Market> {
    return new Observable<Market>(subscriber => {
      this.#markets.forEach(market => market.onPriceChanged().subscribe(subscriber));
    });
  }

  get(pair: string): Market {
    const market = this.#markets.get(pair);
    if (!market) throw new Error(`Market not found for ${pair}`);
    return market;
  }
}
