import { BaseOrder, BaseOrderConfig } from './BaseOrder.js';
import type { Wallet } from './Wallet.js';

export interface LimitOrderConfig extends BaseOrderConfig {
  type: 'limit';
  limitPrice: number;
}

export class LimitOrder extends BaseOrder {
  constructor(
    public override readonly config: LimitOrderConfig,
    sellingWallet: Wallet,
    buyingWallet: Wallet,
  ) {
    super(config, sellingWallet, buyingWallet);
  }

  override fill(): this {
    return super.fill(this.config.limitPrice);
  }
}
