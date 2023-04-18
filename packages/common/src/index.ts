type X = number;
type Y = number;

interface Point {
  x: X;
  y: Y;
}

export type Source = 'wallet' | 'orders';

export interface Metadata {
  owner: string;
  currency: string;
  source: Source;
}

export interface Serie {
  meta: Metadata;
  data: Point[];
}
