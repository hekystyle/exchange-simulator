import { Wallet } from './Wallet.js';

type Wallets = {
  [Currency in 'EUR' | 'BTC']: Wallet;
};

export type Owner = string;

export class Account implements Wallets {
  EUR = new Wallet('EUR');

  BTC = new Wallet('BTC');

  constructor(public readonly owner: Owner) {}

  get wallets() {
    return [this.EUR, this.BTC];
  }

  toJSON() {
    return {
      owner: this.owner,
      EUR: this.EUR.toJSON(),
      BTC: this.BTC.toJSON(),
    };
  }
}
