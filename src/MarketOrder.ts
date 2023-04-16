import { BaseOrder, BaseOrderConfig } from './BaseOrder';
import type { Wallet } from './Wallet';

export interface MarketOrderConfig extends BaseOrderConfig {
  type: 'market';
}

export class MarketOrder extends BaseOrder {
  constructor(public override readonly config: MarketOrderConfig, sellingWallet: Wallet, buyingWallet: Wallet) {
    super(config, sellingWallet, buyingWallet);
  }
}
