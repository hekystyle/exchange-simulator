import dayjs from 'dayjs';
import { limitPrices } from './limitPrices.js';
import type { Exchange } from './SimulatedExchange.js';

export class StrategyEnhancedDCA {
  constructor(public readonly sellingAmountPerOrder: number) {}

  setup(exchange: Exchange) {
    const account = exchange.accounts.open('Enhanced DCA');
    const { wallets } = account;

    exchange.markets
      .get('BTCEUR')
      .onOpened()
      .subscribe(market => {
        const date = market.currentDate;
        const isStartOfMonth = dayjs(date).isSame(dayjs(date).startOf('month'));

        if (isStartOfMonth) {
          exchange.orders.cancelByOwner(account.owner);

          // create market order for remaining funds
          if (wallets.EUR.balance > 0)
            exchange.orders.create({
              type: 'market',
              direction: 'buy',
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
            exchange.orders.create({
              type: 'limit',
              direction: 'buy',
              owner: account.owner,
              pair: { base: 'BTC', quote: 'EUR' },
              limitPrice: price,
              sellingAmount: Math.min(wallets.EUR.balance, this.sellingAmountPerOrder),
            });
          });
        }
      });

    exchange.onSimulationFinishing().subscribe(sender => {
      sender.orders.cancelByOwner(account.owner);

      if (wallets.EUR.balance > 0)
        sender.orders.create({
          type: 'market',
          direction: 'buy',
          owner: account.owner,
          pair: { base: 'BTC', quote: 'EUR' },
          sellingAmount: wallets.EUR.balance,
        });
    });
  }
}
