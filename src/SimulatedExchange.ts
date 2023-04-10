import dayjs from 'dayjs';
import { Accounts } from './Accounts';
import { BTCEUR_YEAR_DAILY_CANDLES } from './data';
import { TypedEventEmitter } from './TypedEventEmitter';

interface TradingPair<T extends [string, string]> {
  base: T[0];
  quote: T[1];
}

interface BaseOrderConfig {
  type: string;
  owner: string;
  pair: TradingPair<['BTC', 'EUR']>;
  sellingAmount: number;
}

interface MarketOrderConfig extends BaseOrderConfig {
  type: 'market';
}

type OrderConfig = MarketOrderConfig;

type Events = {
  dayOpened: [Exchange, Date];
};

export interface Exchange extends TypedEventEmitter<Events> {
  accounts: Accounts;
  currentPrice: number;
  putOrder(orderConfig: OrderConfig): this;
}

export class SimulatedExchange extends TypedEventEmitter<Events> implements Exchange {
  public readonly accounts = new Accounts();

  #currentPrice: number | undefined = undefined;

  constructor(initialPrice: number) {
    super();
    this.#currentPrice = initialPrice;
  }

  get currentPrice() {
    if (!this.#currentPrice) {
      throw new Error('Exchange needs to be simulated first');
    }
    return this.#currentPrice;
  }

  putOrder(orderConfig: OrderConfig) {
    const account = this.accounts.get(orderConfig.owner);

    switch (orderConfig.type) {
      case 'market':
        account[orderConfig.pair.base].withdraw(orderConfig.sellingAmount);
        account[orderConfig.pair.quote].deposit(orderConfig.sellingAmount / this.currentPrice);
        break;
      default:
        throw new Error(`Unknown order type: ${orderConfig.type}`);
    }

    return this;
  }

  simulate() {
    BTCEUR_YEAR_DAILY_CANDLES.forEach(candle => {
      const date = dayjs(candle.date);

      date.get('days');

      this.handlePriceChange(candle.open);

      this.emit('dayOpened', this, date.toDate());

      this.handlePriceChange(candle.high);
      this.handlePriceChange(candle.low);
      this.handlePriceChange(candle.close);
    });
  }

  private handlePriceChange(price: number) {
    this.#currentPrice = price;
  }
}
