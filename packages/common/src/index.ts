type X = number;
type Y = number;

interface Point {
  x: X;
  y: Y;
}

export type Source = 'wallet' | 'orders' | 'fear-and-greed-index';

export interface Metadata {
  owner?: string;
  unit: string;
  source: Source;
}

export interface Serie {
  meta: Metadata;
  data: Point[];
}
