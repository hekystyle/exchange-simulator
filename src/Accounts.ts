import { Wallet } from './Wallet';

export type Owner = string;

type Wallets = {
  [Currency in 'EUR' | 'BTC']: Wallet;
};

export interface Account extends Wallets {
  owner: Owner;
}

export class Accounts {
  #accounts: Map<Owner, Account> = new Map();

  open(owner: Owner): Account {
    if (this.#accounts.has(owner)) throw new Error(`Account already exists for ${owner}`);

    const account: Account = {
      owner,
      EUR: new Wallet('EUR'),
      BTC: new Wallet('BTC'),
    };

    this.#accounts.set(owner, account);

    return account;
  }

  get(owner: Owner): Account {
    const account = this.#accounts.get(owner);
    if (!account) throw new Error(`Account not found for ${owner}`);
    return account;
  }

  toJSON() {
    return Array.from(this.#accounts.values()).map(account => ({
      owner: account.owner,
      EUR: account.EUR.toJSON(),
      BTC: account.BTC.toJSON(),
    }));
  }
}
