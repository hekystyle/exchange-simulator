import { Subject, Observable } from 'rxjs';

export class Market {
  #onOpened = new Subject<Market>();

  #onPriceChanged = new Subject<Market>();

  #isOpen = false;

  #currentPrice: number | undefined = undefined;

  #currentDate: Date | undefined = undefined;

  constructor(public readonly name: 'BTCEUR') {}

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

  onOpened(): Observable<Market> {
    return this.#onOpened.asObservable();
  }

  onPriceChanged(): Observable<Market> {
    return this.#onPriceChanged.asObservable();
  }

  open(price: number, date: Date): this {
    if (this.#isOpen) {
      throw new Error('Market is already open');
    }
    this.#isOpen = true;
    this.#currentPrice = price;
    this.#currentDate = date;
    this.#onOpened.next(this);
    this.#onPriceChanged.next(this);
    return this;
  }

  changePrice(price: number): this {
    if (!this.#isOpen) {
      throw new Error('Market is not open');
    }
    this.#currentPrice = price;
    this.#onPriceChanged.next(this);
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
