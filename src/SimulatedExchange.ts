import dayjs from 'dayjs';
import { Accounts } from './Accounts.js';
import { LimitOrder, LimitOrderConfig } from './LimitOrder.js';
import { MarketOrder, MarketOrderConfig } from './MarketOrder.js';
import { TypedEventEmitter } from './TypedEventEmitter.js';
import type { Candle } from './data.js';

type Order = MarketOrder | LimitOrder;

type Orders = Order[];

type OrderConfig = MarketOrderConfig | LimitOrderConfig;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Events = {
  dayOpened: [Exchange, Date];
  dayClosed: [Exchange, Date];
  simulationFinished: [Exchange, Date];
};

export interface Exchange extends TypedEventEmitter<Events> {
  accounts: Accounts;
  currentPrice: number;
  orders: Orders;
  putOrder(orderConfig: OrderConfig): this;
  cancelAllOrders(owner: string): this;
}

export class SimulatedExchange extends TypedEventEmitter<Events> implements Exchange {
  public readonly accounts = new Accounts();

  #currentPrice: number | undefined = undefined;

  #orders: Order[] = [];

  get currentPrice() {
    if (!this.#currentPrice) {
      throw new Error('Exchange needs to be simulated first');
    }
    return this.#currentPrice;
  }

  get orders() {
    return Array.from(this.#orders);
  }

  putOrder(orderConfig: OrderConfig) {
    const { wallets } = this.accounts.get(orderConfig.owner);
    const buyingWallet = wallets[orderConfig.pair.base];
    const sellingWallet = wallets[orderConfig.pair.quote];

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

    this.tryFillOrder(order, this.currentPrice);
    this.#orders.push(order);

    return this;
  }

  cancelAllOrders(owner: string): this {
    this.#orders
      .filter(order => order.config.owner === owner && order.status === 'open')
      .forEach(order => order.cancel());
    return this;
  }

  simulate(candles: Candle[]) {
    let lastDate = dayjs();
    candles.forEach(candle => {
      const date = dayjs(candle.date);
      lastDate = date;
      date.get('days');

      this.handlePriceChange(candle.open);

      this.emit('dayOpened', this, date.toDate());

      this.handlePriceChange(candle.high);
      this.handlePriceChange(candle.low);
      this.handlePriceChange(candle.close);

      this.emit('dayClosed', this, date.toDate());
    });

    this.orders.filter(order => order.status === 'open').forEach(order => order.cancel());

    this.emit('simulationFinished', this, lastDate.add(1, 'day').toDate());
  }

  private handlePriceChange(price: number) {
    this.#currentPrice = price;
    this.#orders.forEach(order => order.status === 'open' && this.tryFillOrder(order, price));
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
