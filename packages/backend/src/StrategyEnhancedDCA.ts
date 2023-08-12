import { Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { OrderSide } from './BaseOrder.js';
import { limitPrices } from './limitPrices.js';
import { Market, MarketOpenedEvent } from './Market.js';
import { SimulatedExchange, SimulationFinishingEvent } from './SimulatedExchange.js';

export class StrategyEnhancedDCA {
  readonly #logger = new Logger(StrategyEnhancedDCA.name);

  constructor(
    @Inject(SimulatedExchange)
    public readonly exchange: SimulatedExchange,
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
  ) {}

  setup(sellingAmountPerOrder: number) {
    this.#logger.debug(this.setup.name);
    const { exchange } = this;

    const account = exchange.accounts.open('Enhanced DCA');
    const { wallets } = account;

    this.eventEmitter.on(Market.OPENED, (event: MarketOpenedEvent) => {
      const { sender: market } = event;

      if (market.name !== 'BTCEUR') return;
      const date = market.currentDate;
      const isStartOfMonth = dayjs(date).isSame(dayjs.utc(date).startOf('month'));

      if (isStartOfMonth) {
        this.#logger.debug(`start of month ${date.toISOString()}`);

        exchange.orders.cancelByOwner(account.owner);

        // create market order for remaining funds
        if (wallets.EUR.balance > 0)
          exchange.orders.create({
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
          exchange.orders.create({
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

    this.eventEmitter.on(SimulatedExchange.SIMULATION_FINISHING, (event: SimulationFinishingEvent) => {
      const { sender } = event;

      sender.orders.cancelByOwner(account.owner);

      if (wallets.EUR.balance > 0)
        sender.orders.create({
          type: 'market',
          side: OrderSide.Buy,
          owner: account.owner,
          pair: { base: 'BTC', quote: 'EUR' },
          sellingAmount: wallets.EUR.balance,
        });
    });
  }
}
