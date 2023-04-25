import { Inject } from '@nestjs/common';
import dayjs from 'dayjs';
import { Accounts } from './Accounts.js';
import { LimitOrder, LimitOrderConfig } from './LimitOrder.js';
import { MarketOrder, MarketOrderConfig } from './MarketOrder.js';
import { Markets } from './Markets.js';
import { TypedEventEmitter } from './TypedEventEmitter.js';
import type { Candle } from './data.js';
import type { Market } from './Market.js';

type Order = MarketOrder | LimitOrder;

type Orders = Order[];

type OrderConfig = MarketOrderConfig | LimitOrderConfig;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Events = {
  tick: [Exchange, Date];
  simulationFinishing: [Exchange];
  simulationFinished: [Exchange, Date];
};

export interface Exchange extends TypedEventEmitter<Events> {
  accounts: Accounts;
  orders: Orders;
  markets: Markets;
  putOrder(orderConfig: OrderConfig): this;
  cancelAllOrders(owner: string): this;
}

export class SimulatedExchange extends TypedEventEmitter<Events> implements Exchange {
  public readonly accounts = new Accounts();

  #orders: Order[] = [];

  #simulationFinished = false;

  constructor(
    @Inject(Markets)
    public readonly markets: Markets,
  ) {
    super();
  }

  get orders() {
    return Array.from(this.#orders);
  }

  putOrder(orderConfig: OrderConfig) {
    if (this.#simulationFinished) {
      throw new Error('Simulation is already finished');
    }
    const market = this.markets.get(`${orderConfig.pair.base}${orderConfig.pair.quote}` as const);
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

    this.tryFillOrder(order, market.currentPrice);
    this.#orders.push(order);

    return this;
  }

  cancelAllOrders(owner: string): this {
    this.#orders
      .filter(order => order.config.owner === owner && order.status === 'open')
      .forEach(order => order.cancel());
    return this;
  }

  simulate({ candles, pair }: { candles: Candle[]; pair: 'BTCEUR' }) {
    let lastDate = dayjs();
    const market = this.markets.get(pair);
    candles.forEach(candle => {
      const date = dayjs(candle.date);
      lastDate = date;

      this.emit('tick', this, date.toDate());

      market.open(candle.open, date.toDate());
      this.handlePriceChange(market);

      market.changePrice(candle.high);
      this.handlePriceChange(market);

      market.changePrice(candle.low);
      this.handlePriceChange(market);

      market.changePrice(candle.close);
      this.handlePriceChange(market);

      market.close();
    });

    this.emit('simulationFinishing', this);

    this.orders.filter(order => order.status === 'open').forEach(order => order.cancel());

    this.#simulationFinished = true;
    this.emit('simulationFinished', this, lastDate.add(1, 'day').toDate());
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
