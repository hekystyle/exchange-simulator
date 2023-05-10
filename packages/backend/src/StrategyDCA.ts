import { Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import type { Exchange } from './SimulatedExchange.js';

export class StrategyDCA {
  #amountPerDay = 0;

  readonly #logger = new Logger(StrategyDCA.name);

  setup(exchange: Exchange) {
    const account = exchange.accounts.open('DCA');
    const { wallets } = account;

    exchange.markets
      .get('BTCEUR')
      .onOpened()
      .subscribe(market => {
        const date = market.currentDate;
        const isStartOfMonth = dayjs(date).isSame(dayjs(date).startOf('month'));

        if (isStartOfMonth) {
          this.#logger.log('start of month');

          wallets.EUR.deposit(100);
          this.#amountPerDay = Decimal.div(wallets.EUR.balance, dayjs(date).daysInMonth())
            .toDecimalPlaces(2)
            .toNumber();
        }

        exchange.orders.create({
          type: 'market',
          direction: 'buy',
          pair: { base: 'BTC', quote: 'EUR' },
          owner: account.owner,
          sellingAmount: Math.min(this.#amountPerDay, wallets.EUR.balance),
        });
      });
  }
}
