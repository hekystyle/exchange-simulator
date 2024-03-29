import { BaseOrder, BaseOrderConfig } from './base-order.js';
import type { Wallet } from '../wallets/wallet.js';

export interface MarketOrderConfig extends BaseOrderConfig {
  type: 'market';
}

export class MarketOrder extends BaseOrder {
  constructor(
    public override readonly config: MarketOrderConfig,
    sellingWallet: Wallet,
    buyingWallet: Wallet,
  ) {
    super(config, sellingWallet, buyingWallet);
  }
}
