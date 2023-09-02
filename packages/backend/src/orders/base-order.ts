// eslint-disable-next-line max-classes-per-file
import { Decimal } from 'decimal.js';
import { TradingPair } from '../markets/trading-pair.js';
import { StrictOmit } from '../utils/StrictOmit.js';
import type { Wallet } from '../wallets/wallet.js';

export enum OrderSide {
  Buy = 'buy',
  Sell = 'sell',
}

export interface BaseOrderConfig {
  type: string;
  side: OrderSide.Buy;
  owner: string;
  pair: StrictOmit<TradingPair<'BTC', 'EUR'>, 'symbol' | 'equals'>;
  sellingAmount: number;
}

export class BaseOrder {
  #status: 'open' | 'filled' | 'canceled' = 'open';

  constructor(
    public readonly config: BaseOrderConfig,
    public readonly sellingWallet: Wallet,
    public readonly buyingWallet: Wallet,
  ) {
    if (config.sellingAmount <= 0) {
      throw new Error('Selling amount must be positive');
    }
    // reserve funds
    this.sellingWallet.withdraw(config.sellingAmount);
  }

  get status() {
    return this.#status;
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

  fill(price: number): this {
    if (this.#status !== 'open') {
      throw new Error('Order needs to be open to be filled');
    }
    this.#status = 'filled';
    const buyingAmount = Decimal.div(this.config.sellingAmount, price).toNumber();
    this.buyingWallet.deposit(buyingAmount);
    return this;
  }
}
