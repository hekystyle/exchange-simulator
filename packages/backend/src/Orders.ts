import { Inject } from '@nestjs/common';
import { Accounts } from './Accounts.js';
import { LimitOrder, LimitOrderConfig } from './LimitOrder.js';
import { MarketOrder, MarketOrderConfig } from './MarketOrder.js';
import { Markets } from './Markets.js';
import type { Market } from './Market.js';

export type Order = MarketOrder | LimitOrder;

export type OrderConfig = MarketOrderConfig | LimitOrderConfig;

export class Orders implements Iterable<Order> {
  #orders: Order[] = [];

  constructor(
    @Inject(Accounts)
    public readonly accounts: Accounts,
    @Inject(Markets)
    public readonly markets: Markets,
  ) {
    markets.onPriceChanged().subscribe(this.handlePriceChange.bind(this));
  }

  [Symbol.iterator]() {
    return this.#orders.values();
  }

  create(orderConfig: OrderConfig) {
    const market = this.markets.get(`${orderConfig.pair.base}${orderConfig.pair.quote}` as const);
    const { wallets } = this.accounts.get(orderConfig.owner);
    let buyingWallet = wallets[orderConfig.pair.base];
    let sellingWallet = wallets[orderConfig.pair.quote];

    if (orderConfig.direction === 'sell') {
      // switch accounts
      buyingWallet = wallets[orderConfig.pair.quote];
      sellingWallet = wallets[orderConfig.pair.base];
    }

    let order: Order | undefined;
    switch (orderConfig.type) {
      case 'market':
        order = new MarketOrder(orderConfig, sellingWallet, buyingWallet);
        break;
      case 'limit':
        order = new LimitOrder(orderConfig, sellingWallet, buyingWallet);
        break;
      default:
        throw new Error(`Unknown order type: ${(orderConfig as OrderConfig).type}`);
    }

    this.tryFillOrder(order, market.currentPrice);
    this.#orders.push(order);

    return this;
  }

  cancelAll(): this {
    this.#orders.filter(order => order.status === 'open').forEach(order => order.cancel());
    return this;
  }

  cancelByOwner(owner: string): this {
    this.#orders
      .filter(order => order.config.owner === owner && order.status === 'open')
      .forEach(order => order.cancel());
    return this;
  }

  private handlePriceChange(market: Market) {
    this.#orders.forEach(
      order =>
        order.status === 'open' &&
        market.name === (`${order.config.pair.base}${order.config.pair.quote}` as const) &&
        this.tryFillOrder(order, market.currentPrice),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private tryFillOrder(order: Order, price: number) {
    if (order instanceof MarketOrder) {
      order.fill(price);
    } else if (order instanceof LimitOrder) {
      if (order.config.limitPrice >= price) {
        order.fill();
      }
    } else {
      throw new Error(`Unknown order type: ${order as string}`);
    }
  }
}
