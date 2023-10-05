import assert from 'assert';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { Listener } from 'eventemitter2';
import { Account } from '../accounts/account.js';
import { Accounts } from '../accounts/accounts.js';
import { limitPrices } from '../limit-prices.js';
import { MarketOpenedEvent } from '../markets/market.js';
import { TradingPair } from '../markets/trading-pair.js';
import { OrderSide } from '../orders/base-order.js';
import { Orders } from '../orders/orders.js';
import { SimulationFinishingEvent } from '../simulated-exchange.js';
import { Strategy } from './strategy.interface.js';

@Injectable()
export class StrategyEnhancedDCA implements Strategy {
  private readonly logger = new Logger(StrategyEnhancedDCA.name);

  private account: Account | undefined;

  private sellingAmountPerOrder: number | undefined;

  private pair = new TradingPair('BTC', 'EUR');

  private listeners?: Listener[] | undefined;

  constructor(
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
    @Inject(Accounts)
    private readonly accounts: Accounts,
    @Inject(Orders)
    private readonly orders: Orders,
  ) {}

  get enabled(): boolean {
    return !!this.listeners;
  }

  setup(sellingAmountPerOrder: number) {
    this.logger.log('Setting up strategy...');

    this.sellingAmountPerOrder = sellingAmountPerOrder;

    if (!this.account) {
      this.logger.log('Opening account...');
      this.account = this.accounts.open('Enhanced DCA');
    }

    this.enable();
  }

  enable() {
    this.listeners = [
      this.eventEmitter.on(MarketOpenedEvent.ID, this.handleMarketOpened.bind(this), {
        objectify: true,
      }) as Listener,
      this.eventEmitter.on(SimulationFinishingEvent.ID, this.handleSimulationFinishing.bind(this), {
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
    const { sender: market } = event;

    assert(this.account, 'Account not opened');
    assert(this.sellingAmountPerOrder, 'Selling amount per order not set');
    const { account, sellingAmountPerOrder } = this;
    const { wallets } = account;

    if (!market.pair.equals(this.pair)) return;

    const sellingWallet = wallets.get(this.pair.quote);

    const date = market.currentDate;
    const isStartOfMonth = dayjs(date).isSame(dayjs.utc(date).startOf('month'));

    if (isStartOfMonth) {
      this.logger.debug(`start of month ${date.toISOString()}`);

      this.orders.cancelByOwner(account.owner);

      // create market order for remaining funds
      if (sellingWallet.balance > 0)
        this.orders.create({
          type: 'market',
          side: OrderSide.Buy,
          owner: account.owner,
          pair: this.pair,
          sellingAmount: sellingWallet.balance,
        });

      // add new funds to EUR account
      sellingWallet.deposit(100);

      // create limit orders for new funds
      const { currentPrice } = market;
      const availableFunds = sellingWallet.balance;

      limitPrices(currentPrice, availableFunds, sellingAmountPerOrder).forEach(price => {
        this.orders.create({
          type: 'limit',
          side: OrderSide.Buy,
          owner: account.owner,
          pair: this.pair,
          limitPrice: price,
          sellingAmount: Math.min(sellingWallet.balance, sellingAmountPerOrder),
        });
      });
    }
  }

  private handleSimulationFinishing() {
    assert(this.account, 'Account not opened');

    const { account } = this;
    const { wallets } = account;

    const sellingWallet = wallets.get(this.pair.quote);

    this.orders.cancelByOwner(this.account.owner);

    if (sellingWallet.balance > 0)
      this.orders.create({
        type: 'market',
        side: OrderSide.Buy,
        owner: account.owner,
        pair: this.pair,
        sellingAmount: sellingWallet.balance,
      });
  }
}
