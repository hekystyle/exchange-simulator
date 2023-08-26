import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { Accounts } from '../accounts/accounts.js';
import { limitPrices } from '../limit-prices.js';
import { MarketOpenedEvent } from '../markets/market.js';
import { OrderSide } from '../orders/base-order.js';
import { Orders } from '../orders/orders.js';
import { SimulationFinishingEvent } from '../simulated-exchange.js';

@Injectable()
export class StrategyEnhancedDCA {
  readonly #logger = new Logger(StrategyEnhancedDCA.name);

  constructor(
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
    @Inject(Accounts)
    private readonly accounts: Accounts,
    @Inject(Orders)
    private readonly orders: Orders,
  ) {}

  setup(sellingAmountPerOrder: number) {
    this.#logger.debug(this.setup.name);

    const account = this.accounts.open('Enhanced DCA');
    const { wallets } = account;

    this.eventEmitter.on(MarketOpenedEvent.ID, (event: MarketOpenedEvent) => {
      const { sender: market } = event;

      if (market.name !== 'BTCEUR') return;
      const date = market.currentDate;
      const isStartOfMonth = dayjs(date).isSame(dayjs.utc(date).startOf('month'));

      if (isStartOfMonth) {
        this.#logger.debug(`start of month ${date.toISOString()}`);

        this.orders.cancelByOwner(account.owner);

        // create market order for remaining funds
        if (wallets.EUR.balance > 0)
          this.orders.create({
            type: 'market',
            side: OrderSide.Buy,
            owner: account.owner,
            pair: { base: 'BTC', quote: 'EUR' },
            sellingAmount: wallets.EUR.balance,
          });

        // add new funds to EUR account
        wallets.EUR.deposit(100);

        // create limit orders for new funds
        const { currentPrice } = market;
        const availableFunds = wallets.EUR.balance;

        limitPrices(currentPrice, availableFunds, sellingAmountPerOrder).forEach(price => {
          this.orders.create({
            type: 'limit',
            side: OrderSide.Buy,
            owner: account.owner,
            pair: { base: 'BTC', quote: 'EUR' },
            limitPrice: price,
            sellingAmount: Math.min(wallets.EUR.balance, sellingAmountPerOrder),
          });
        });
      }
    });

    this.eventEmitter.on(SimulationFinishingEvent.ID, () => {
      this.orders.cancelByOwner(account.owner);

      if (wallets.EUR.balance > 0)
        this.orders.create({
          type: 'market',
          side: OrderSide.Buy,
          owner: account.owner,
          pair: { base: 'BTC', quote: 'EUR' },
          sellingAmount: wallets.EUR.balance,
        });
    });
  }
}