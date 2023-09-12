import assert from 'assert';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import { Listener } from 'eventemitter2';
import { Account } from '../accounts/account.js';
import { Accounts } from '../accounts/accounts.js';
import { MarketOpenedEvent } from '../markets/market.js';
import { TradingPair } from '../markets/trading-pair.js';
import { OrderSide } from '../orders/base-order.js';
import { Orders } from '../orders/orders.js';
import { IStrategy } from './strategy.interface.js';

@Injectable()
export class StrategyDCA implements IStrategy {
  private readonly logger = new Logger(StrategyDCA.name);

  private account: Account | undefined;

  private pair = new TradingPair('BTC', 'EUR');

  private listeners: Listener[] | undefined;

  #amountPerDay = 0;

  constructor(
    @Inject(Accounts)
    private readonly accounts: Accounts,
    @Inject(Orders)
    private readonly orders: Orders,
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
  ) {}

  get enabled(): boolean {
    return !!this.listeners;
  }

  setup() {
    this.logger.log('Setting up strategy...');

    if (!this.account) {
      this.logger.log('Opening account...');
      this.account = this.accounts.open('DCA');
    }

    this.enable();
  }

  enable() {
    this.listeners = [
      this.eventEmitter.on(MarketOpenedEvent.ID, this.handleMarketOpened.bind(this), {
        objectify: true,
      }) as Listener,
    ];
    return this;
  }

  disable() {
    this.listeners?.forEach(listener => listener.off());
    this.listeners = undefined;
    return this;
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
