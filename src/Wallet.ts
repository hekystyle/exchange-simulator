import Decimal from 'decimal.js';

export class Wallet {
  #balance = 0;

  constructor(public readonly currency: string) {}

  public get balance() {
    return this.#balance;
  }

  deposit(amount: number) {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    this.#balance = Decimal.add(this.#balance, amount).toNumber();
    return this;
  }

  withdraw(amount: number) {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    if (this.#balance < amount) {
      throw new Error('Insufficient balance funds');
    }
    this.#balance = Decimal.sub(this.#balance, amount).toNumber();
    return this;
  }

  toJSON() {
    return {
      currency: this.currency,
      balance: this.formatBalance(),
    };
  }

  private formatBalance() {
    switch (this.currency) {
      case 'BTC':
        return new Decimal(this.#balance).toDecimalPlaces(8).toNumber();
      default:
        return this.#balance;
    }
  }
}
