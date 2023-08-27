export type TradingPairSymbol<
  TBase extends string = string,
  TQuote extends string = string,
> = `${TBase}-${TQuote}`;

export class TradingPair<TBase extends string, TQuote extends string> {
  constructor(
    public readonly base: TBase,
    public readonly quote: TQuote,
  ) {}

  get symbol(): TradingPairSymbol<TBase, TQuote> {
    return `${this.base}-${this.quote}` as const;
  }

  equals(pair: TradingPair<TBase, TQuote>): boolean {
    return this.base === pair.base && this.quote === pair.quote;
  }
}
