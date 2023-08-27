import { Logger } from '@nestjs/common';
import { Wallet } from './wallet.js';

type Currency = string;
type WalletsMap = Map<Currency, Wallet>;

export class Wallets implements Iterable<Wallet> {
  private readonly wallets: WalletsMap = new Map<Currency, Wallet>();

  private readonly logger = new Logger(Wallets.name);

  [Symbol.iterator]() {
    return this.wallets.values();
  }

  get(currency: string): Wallet {
    let wallet = this.wallets.get(currency);

    if (!wallet) {
      this.logger.log(`Creating new wallet for ${currency}`);
      wallet = new Wallet(currency);
      this.wallets.set(currency, wallet);
    }

    return wallet;
  }

  toJSON() {
    return Array.from(this.wallets.values()).reduce(
      (acc, wallet) => {
        acc[wallet.currency] = wallet.toJSON();
        return acc;
      },
      {} as Record<Currency, unknown>,
    );
  }
}
