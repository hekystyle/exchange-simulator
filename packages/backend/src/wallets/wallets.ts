import { Wallet } from './wallet.js';

type WalletsMap = {
  [Currency in 'EUR' | 'BTC']: Wallet;
};

export class Wallets implements Iterable<Wallet>, WalletsMap {
  #EUR = new Wallet('EUR');

  #BTC = new Wallet('BTC');

  get EUR(): Wallet {
    return this.#EUR;
  }

  get BTC(): Wallet {
    return this.#BTC;
  }

  [Symbol.iterator]() {
    return [this.#EUR, this.#BTC].values();
  }

  toJSON() {
    return {
      EUR: this.#EUR.toJSON(),
      BTC: this.#BTC.toJSON(),
    };
  }
}
