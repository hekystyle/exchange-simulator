import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import { BTC_FNG } from './data/fng.js';
import { Exchange } from './SimulatedExchange.js';

export class StrategyFNG {
  #amountPerDay = 0;

  setup(exchange: Exchange) {
    const account = exchange.accounts.open('F&G');
    const { wallets } = account;

    exchange.markets
      .get('BTCEUR')
      .onOpened()
      .subscribe(market => {
        const date = market.currentDate;
        const isStartOfMonth = dayjs.utc(date).isSame(dayjs.utc(date).startOf('month'));

        if (isStartOfMonth) {
          wallets.EUR.deposit(100);
          this.#amountPerDay = Decimal.div(wallets.EUR.balance, dayjs(date).daysInMonth())
            .toDecimalPlaces(2)
            .toNumber();
        }

        const greedIndex = BTC_FNG.get(date.toISOString());
        if (!greedIndex) throw new Error(`No fear and greed index for ${date.toISOString()}`);
        if (greedIndex < 50) {
          // buy DCA
          if (wallets.EUR.balance > 0)
            exchange.orders.create({
              type: 'market',
              direction: 'buy',
              pair: { base: 'BTC', quote: 'EUR' },
              owner: account.owner,
              sellingAmount: Math.min(this.#amountPerDay, wallets.EUR.balance),
            });
        } else {
          // sell 1% of BTC
          exchange.orders.create({
            type: 'market',
            direction: 'sell',
            pair: { base: 'BTC', quote: 'EUR' },
            owner: account.owner,
            sellingAmount: Math.min(wallets.BTC.balance * 0.01, wallets.BTC.balance),
          });
        }
      });
  }
}
