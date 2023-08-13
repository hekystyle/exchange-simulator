/* eslint-disable max-classes-per-file */
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event } from './Event.js';

export class MarketOpenedEvent extends Event<Market> {
  static ID = 'market.opened' as const;
}

export class MarketPriceChangedEvent extends Event<Market> {
  static ID = 'market.priceChanged' as const;
}

export class Market {
  #isOpen = false;

  #currentPrice: number | undefined = undefined;

  #currentDate: Date | undefined = undefined;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    public readonly name: 'BTCEUR',
  ) {}

  get currentPrice(): number {
    if (!this.#currentPrice) {
      throw new Error('Market was not opened');
    }
    return this.#currentPrice;
  }

  get currentDate(): Date {
    if (!this.#currentDate) {
      throw new Error('Market was not opened');
    }
    return this.#currentDate;
  }

  open(price: number, date: Date): this {
    if (this.#isOpen) {
      throw new Error('Market is already open');
    }
    this.#isOpen = true;
    this.#currentPrice = price;
    this.#currentDate = date;
    this.eventEmitter.emit(MarketOpenedEvent.ID, new MarketOpenedEvent(this));
    this.eventEmitter.emit(MarketPriceChangedEvent.ID, new MarketPriceChangedEvent(this));
    return this;
  }

  changePrice(price: number): this {
    if (!this.#isOpen) {
      throw new Error('Market is not open');
    }
    this.#currentPrice = price;
    this.eventEmitter.emit(MarketPriceChangedEvent.ID, new MarketPriceChangedEvent(this));
    return this;
  }

  close(): this {
    if (!this.#isOpen) {
      throw new Error('Market is not open');
    }
    this.#isOpen = false;
    return this;
  }
}
