import Decimal from 'decimal.js';
import type { BaseOrderConfig } from './SimulatedExchange';
import type { Wallet } from './Wallet';

export interface LimitOrderConfig extends BaseOrderConfig {
  type: 'limit';
  limitPrice: number;
}

export class LimitOrder {
  #status: 'open' | 'filled' | 'canceled' = 'open';

  constructor(
    public readonly config: LimitOrderConfig,
    public readonly sellingWallet: Wallet,
    public readonly buyingWallet: Wallet,
  ) {
    // reserve funds
    this.sellingWallet.withdraw(config.sellingAmount);
  }

  get status() {
    return this.#status;
  }

  fill(): this {
    if (this.#status !== 'open') {
      throw new Error('Order needs to be open to be filled');
    }
    const buyingAmount = Decimal.div(this.config.sellingAmount, this.config.limitPrice).toNumber();
    this.buyingWallet.deposit(buyingAmount);
    this.#status = 'filled';
    return this;
  }

  cancel(): this {
    if (this.#status !== 'open') {
      throw new Error('Order needs to be open to be canceled');
    }
    this.#status = 'canceled';
    // return reserved funds
    this.sellingWallet.deposit(this.config.sellingAmount);
    return this;
  }
}
