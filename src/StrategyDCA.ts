import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import type { Exchange } from './SimulatedExchange.js';

export class StrategyDCA {
  #amountPerDay = 0;

  setup(exchange: Exchange) {
    const account = exchange.accounts.open('DCA');
    const { wallets } = account;

    exchange.market('BTCEUR').on('opened', market => {
      const date = market.currentDate;
      const isStartOfMonth = dayjs(date).isSame(dayjs(date).startOf('month'));

      if (isStartOfMonth) {
        wallets.EUR.deposit(100);
        this.#amountPerDay = Decimal.div(wallets.EUR.balance, dayjs(date).daysInMonth()).toDecimalPlaces(2).toNumber();
      }

      exchange.putOrder({
        type: 'market',
        pair: { base: 'BTC', quote: 'EUR' },
        owner: account.owner,
        sellingAmount: Math.min(this.#amountPerDay, wallets.EUR.balance),
      });
    });
  }
}
