import dayjs from 'dayjs';
import { limitPrices } from './limitPrices.js';
import type { Exchange } from './SimulatedExchange.js';

export class StrategyEnhancedDCA {
  constructor(public readonly sellingAmountPerOrder: number) {}

  setup(exchange: Exchange) {
    const account = exchange.accounts.open('Enhanced DCA');
    const { wallets } = account;

    exchange.on('dayOpened', (sender, date) => {
      const isStartOfMonth = dayjs(date).isSame(dayjs(date).startOf('month'));

      if (isStartOfMonth) {
        sender.cancelAllOrders(account.owner);

        // create market order for remaining funds
        if (wallets.EUR.balance > 0)
          sender.putOrder({
            type: 'market',
            owner: account.owner,
            pair: { base: 'BTC', quote: 'EUR' },
            sellingAmount: wallets.EUR.balance,
          });

        // add new funds to EUR account
        wallets.EUR.deposit(100);

        // create limit orders for new funds
        const { currentPrice } = sender;
        const availableFunds = wallets.EUR.balance;

        limitPrices(currentPrice, availableFunds, this.sellingAmountPerOrder).forEach(price => {
          sender.putOrder({
            type: 'limit',
            owner: account.owner,
            pair: { base: 'BTC', quote: 'EUR' },
            limitPrice: price,
            sellingAmount: Math.min(wallets.EUR.balance, this.sellingAmountPerOrder),
          });
        });
      }
    });

    exchange.on('simulationFinished', sender => {
      sender.cancelAllOrders(account.owner);

      sender.putOrder({
        type: 'market',
        owner: account.owner,
        pair: { base: 'BTC', quote: 'EUR' },
        sellingAmount: wallets.EUR.balance,
      });
    });
  }
}
