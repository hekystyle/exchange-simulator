import dayjs from 'dayjs';
import Decimal from 'decimal.js';
import type { Exchange } from './SimulatedExchange';

export class StrategyDCA {
  #amountPerDay = 0;

  setup(exchange: Exchange) {
    const account = exchange.accounts.open(StrategyDCA.name);

    exchange.on('dayOpened', (sender, date) => {
      const isStartOfMonth = dayjs(date).isSame(dayjs(date).startOf('month'));

      if (isStartOfMonth) {
        account.EUR.deposit(100);
        this.#amountPerDay = Decimal.div(account.EUR.balance, dayjs(date).daysInMonth()).toDecimalPlaces(2).toNumber();
        console.log(`New month ${date.toISOString()}, new amount per day: ${this.#amountPerDay}`);
      }

      sender.putOrder({
        type: 'market',
        pair: { base: 'BTC', quote: 'EUR' },
        owner: account.owner,
        sellingAmount: Math.min(this.#amountPerDay, account.EUR.balance),
      });
    });
  }
}
