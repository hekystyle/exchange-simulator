import dayjs from 'dayjs';
import Decimal from 'decimal.js';
import { limitPrices } from './limitPrices';
import type { Exchange } from './SimulatedExchange';

export class StrategyEnhancedDCA {
  constructor(public readonly sellingAmountPerOrder: number) {}

  setup(exchange: Exchange) {
    const account = exchange.accounts.open(StrategyEnhancedDCA.name);

    exchange.on('dayOpened', (sender, date) => {
      const isStartOfMonth = dayjs(date).isSame(dayjs(date).startOf('month'));

      if (isStartOfMonth) {
        sender.cancelAllOrders(account.owner);

        // create market order for remaining funds
        sender.putOrder({
          type: 'market',
          owner: account.owner,
          pair: { base: 'BTC', quote: 'EUR' },
          sellingAmount: account.EUR.balance,
        });

        // add new funds to EUR account
        account.EUR.deposit(100);

        // create limit orders for new funds
        const { currentPrice } = sender;
        const availableFunds = account.EUR.balance;
        let remainingFunds = new Decimal(account.EUR.balance);

        limitPrices(currentPrice, availableFunds, this.sellingAmountPerOrder).forEach(price => {
          remainingFunds = remainingFunds.sub(this.sellingAmountPerOrder);

          sender.putOrder({
            type: 'limit',
            owner: account.owner,
            pair: { base: 'BTC', quote: 'EUR' },
            limitPrice: price,
            sellingAmount: Decimal.min(remainingFunds, this.sellingAmountPerOrder).toNumber(),
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
        sellingAmount: account.EUR.balance,
      });
    });
  }
}