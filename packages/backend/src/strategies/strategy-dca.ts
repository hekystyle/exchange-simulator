import assert from 'assert';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import { Account } from '../accounts/account.js';
import { Accounts } from '../accounts/accounts.js';
import { MarketOpenedEvent } from '../markets/market.js';
import { TradingPair } from '../markets/trading-pair.js';
import { OrderSide } from '../orders/base-order.js';
import { Orders } from '../orders/orders.js';

@Injectable()
export class StrategyDCA {
  private readonly logger = new Logger(StrategyDCA.name);

  private account: Account | undefined;

  private pair = new TradingPair('BTC', 'EUR');

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

    if (!market.pair.equals(this.pair)) return;

    const sellingWallet = wallets.get(this.pair.quote);

    const date = market.currentDate;
    const isStartOfMonth = dayjs(date).isSame(dayjs.utc(date).startOf('month'));

    if (isStartOfMonth) {
      this.logger.debug(`start of month ${date.toISOString()}`);

      sellingWallet.deposit(100);
      this.#amountPerDay = Decimal.div(sellingWallet.balance, dayjs(date).daysInMonth())
        .toDecimalPlaces(2)
        .toNumber();
    }

    if (sellingWallet.balance > 0)
      this.orders.create({
        type: 'market',
        side: OrderSide.Buy,
        pair: market.pair,
        owner: this.account.owner,
        sellingAmount: Math.min(this.#amountPerDay, sellingWallet.balance),
      });
  }
}
