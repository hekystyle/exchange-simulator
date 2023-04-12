import Decimal from 'decimal.js';
import type { BaseOrderConfig } from './SimulatedExchange';

export interface LimitOrderConfig extends BaseOrderConfig {
  type: 'limit';
  limitPrice: number;
}

export class LimitOrder {
  #status: 'open' | 'filled' | 'canceled' = 'open';

  #buyingAmount: number | undefined = undefined;

  constructor(public readonly config: LimitOrderConfig) {}

  get buyingAmount() {
    if (this.#buyingAmount === undefined) {
      throw new Error('Order needs to be filled first');
    }
    return this.#buyingAmount;
  }

  get status() {
    return this.#status;
  }

  fill(price: number): this {
    this.#buyingAmount = Decimal.div(this.config.sellingAmount, price).toNumber();
    this.#status = 'filled';
    return this;
  }

  cancel(): this {
    this.#status = 'canceled';
    return this;
  }
}
