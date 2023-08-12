import { Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import { Accounts } from './Accounts.js';
import { OrderSide } from './BaseOrder.js';
import { MarketOpenedEvent } from './Market.js';
import { Orders } from './Orders.js';

export class StrategyDCA {
  #amountPerDay = 0;

  readonly #logger = new Logger(StrategyDCA.name);

  constructor(
    @Inject(Accounts)
    public readonly accounts: Accounts,
    @Inject(Orders)
    public readonly orders: Orders,
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
  ) {}

  setup() {
    this.#logger.debug(this.setup.name);

    const account = this.accounts.open('DCA');
    const { wallets } = account;

    this.eventEmitter.on(MarketOpenedEvent.ID, (event: MarketOpenedEvent) => {
      const { sender: market } = event;

      if (market.name !== 'BTCEUR') return;
      const date = market.currentDate;
      const isStartOfMonth = dayjs(date).isSame(dayjs.utc(date).startOf('month'));

      if (isStartOfMonth) {
        this.#logger.debug(`start of month ${date.toISOString()}`);

        wallets.EUR.deposit(100);
        this.#amountPerDay = Decimal.div(wallets.EUR.balance, dayjs(date).daysInMonth()).toDecimalPlaces(2).toNumber();
      }

      if (wallets.EUR.balance > 0)
        this.orders.create({
          type: 'market',
          side: OrderSide.Buy,
          pair: { base: 'BTC', quote: 'EUR' },
          owner: account.owner,
          sellingAmount: Math.min(this.#amountPerDay, wallets.EUR.balance),
        });
    });
  }
}
