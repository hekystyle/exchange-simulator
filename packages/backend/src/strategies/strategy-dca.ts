import assert from 'assert';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import { Account } from '../accounts/account.js';
import { Accounts } from '../accounts/accounts.js';
import { MarketOpenedEvent } from '../markets/market.js';
import { OrderSide } from '../orders/base-order.js';
import { Orders } from '../orders/orders.js';

@Injectable()
export class StrategyDCA {
  private readonly logger = new Logger(StrategyDCA.name);

  private account: Account | undefined;

  #amountPerDay = 0;

  constructor(
    @Inject(Accounts)
    private readonly accounts: Accounts,
    @Inject(Orders)
    private readonly orders: Orders,
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
  ) {}

  setup() {
    this.logger.log('Setting up strategy...');

    if (!this.account) {
      this.logger.log('Opening account...');
      this.account = this.accounts.open('DCA');
    }

    this.eventEmitter.on(MarketOpenedEvent.ID, this.handleMarketOpened.bind(this));
  }

  private handleMarketOpened(event: unknown) {
    assert(event instanceof MarketOpenedEvent, `Event is not a ${MarketOpenedEvent.name}`);
    assert(this.account, 'Account not opened');
    const { sender: market } = event;
    const { wallets } = this.account;

    if (market.name !== 'BTCEUR') return;
    const date = market.currentDate;
    const isStartOfMonth = dayjs(date).isSame(dayjs.utc(date).startOf('month'));

    if (isStartOfMonth) {
      this.logger.debug(`start of month ${date.toISOString()}`);

      wallets.EUR.deposit(100);
      this.#amountPerDay = Decimal.div(wallets.EUR.balance, dayjs(date).daysInMonth())
        .toDecimalPlaces(2)
        .toNumber();
    }

    if (wallets.EUR.balance > 0)
      this.orders.create({
        type: 'market',
        side: OrderSide.Buy,
        pair: { base: 'BTC', quote: 'EUR' },
        owner: this.account.owner,
        sellingAmount: Math.min(this.#amountPerDay, wallets.EUR.balance),
      });
  }
}
