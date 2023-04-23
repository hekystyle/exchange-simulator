import dayjs from 'dayjs';
import { limitPrices } from './limitPrices.js';
import type { Exchange } from './SimulatedExchange.js';

export class StrategyEnhancedDCA {
  constructor(public readonly sellingAmountPerOrder: number) {}

  setup(exchange: Exchange) {
    const account = exchange.accounts.open('Enhanced DCA');
    const { wallets } = account;

    exchange.market('BTCEUR').on('opened', market => {
      const date = market.currentDate;
      const isStartOfMonth = dayjs(date).isSame(dayjs(date).startOf('month'));

      if (isStartOfMonth) {
        exchange.cancelAllOrders(account.owner);

        // create market order for remaining funds
        if (wallets.EUR.balance > 0)
          exchange.putOrder({
            type: 'market',
            owner: account.owner,
            pair: { base: 'BTC', quote: 'EUR' },
            sellingAmount: wallets.EUR.balance,
          });

        // add new funds to EUR account
        wallets.EUR.deposit(100);

        // create limit orders for new funds
        const { currentPrice } = market;
        const availableFunds = wallets.EUR.balance;

        limitPrices(currentPrice, availableFunds, this.sellingAmountPerOrder).forEach(price => {
          exchange.putOrder({
            type: 'limit',
            owner: account.owner,
            pair: { base: 'BTC', quote: 'EUR' },
            limitPrice: price,
            sellingAmount: Math.min(wallets.EUR.balance, this.sellingAmountPerOrder),
          });
        });
      }
    });

    exchange.on('simulationFinishing', sender => {
      sender.cancelAllOrders(account.owner);

      if (wallets.EUR.balance > 0)
        sender.putOrder({
          type: 'market',
          owner: account.owner,
          pair: { base: 'BTC', quote: 'EUR' },
          sellingAmount: wallets.EUR.balance,
        });
    });
  }
}
