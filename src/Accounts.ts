import { Account, Owner } from './Account.js';

export class Accounts {
  #accounts = new Map<Owner, Account>();

  open(owner: Owner): Account {
    if (this.#accounts.has(owner)) throw new Error(`Account already exists for ${owner}`);

    const account = new Account(owner);

    this.#accounts.set(owner, account);

    return account;
  }

  get(owner: Owner): Account {
    const account = this.#accounts.get(owner);
    if (!account) throw new Error(`Account not found for ${owner}`);
    return account;
  }

  toJSON() {
    return Array.from(this.#accounts.values()).map(account => account.toJSON());
  }
}
