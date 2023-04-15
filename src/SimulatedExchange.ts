import dayjs from 'dayjs';
import { Accounts } from './Accounts';
import { LimitOrder, LimitOrderConfig } from './LimitOrder';
import { TypedEventEmitter } from './TypedEventEmitter';
import type { Candle } from './data';

type Order = LimitOrder;

interface TradingPair<T extends [string, string]> {
  base: T[0];
  quote: T[1];
}

export interface BaseOrderConfig {
  type: string;
  owner: string;
  pair: TradingPair<['BTC', 'EUR']>;
  sellingAmount: number;
}

interface MarketOrderConfig extends BaseOrderConfig {
  type: 'market';
}

type OrderConfig = MarketOrderConfig | LimitOrderConfig;

type Events = {
  dayOpened: [Exchange, Date];
  simulationFinished: [Exchange];
};

export interface Exchange extends TypedEventEmitter<Events> {
  accounts: Accounts;
  currentPrice: number;
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

  putOrder(orderConfig: OrderConfig) {
    const account = this.accounts.get(orderConfig.owner);
    const buyingWallet = account[orderConfig.pair.base];
    const sellingWallet = account[orderConfig.pair.quote];

    let order: Order | undefined;
    switch (orderConfig.type) {
      case 'market':
        account[orderConfig.pair.quote].withdraw(orderConfig.sellingAmount);
        account[orderConfig.pair.base].deposit(orderConfig.sellingAmount / this.currentPrice);
        break;
      case 'limit':
        order = new LimitOrder(orderConfig, sellingWallet, buyingWallet);
        this.tryFillOrder(order, this.currentPrice);
        this.#orders.push(order);
        break;
      default:
        throw new Error(`Unknown order type: ${(orderConfig as OrderConfig).type}`);
    }

    return this;
  }

  cancelAllOrders(owner: string): this {
    this.#orders
      .filter(order => order.config.owner === owner && order.status === 'open')
      .forEach(order => order.cancel());
    return this;
  }

  simulate(candles: Candle[]) {
    candles.forEach(candle => {
      const date = dayjs(candle.date);

      date.get('days');

      this.handlePriceChange(candle.open);

      this.emit('dayOpened', this, date.toDate());

      this.handlePriceChange(candle.high);
      this.handlePriceChange(candle.low);
      this.handlePriceChange(candle.close);
    });

    this.emit('simulationFinished', this);
  }

  private handlePriceChange(price: number) {
    this.#currentPrice = price;
    this.#orders.forEach(order => order.status === 'open' && this.tryFillOrder(order, price));
  }

  // eslint-disable-next-line class-methods-use-this
  private tryFillOrder(order: Order, price: number) {
    if (order instanceof LimitOrder && order.config.limitPrice >= price) {
      order.fill();
    }
  }
}
