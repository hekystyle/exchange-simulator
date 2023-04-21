import { Wallets } from './Wallets.js';

export type Owner = string;

export class Account {
  #wallets = new Wallets();

  constructor(public readonly owner: Owner) {}

  get wallets(): Wallets {
    return this.#wallets;
  }

  toJSON() {
    return {
      owner: this.owner,
      wallets: this.#wallets.toJSON(),
    };
  }
}
