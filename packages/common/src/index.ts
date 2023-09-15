import { z } from 'zod';

type X = number;
type Y = number;

interface Point {
  x: X;
  y: Y;
}

type CompactPoint = [X, Y];

export const compactPoint = ({ x, y }: Point): CompactPoint => [x, y];

export type Source = 'wallet' | 'orders';

export interface Metadata {
  owner: string;
  unit: string;
  source: Source;
}

export interface Serie {
  meta: Metadata;
  data: CompactPoint[];
}

export const strategySchema = z.object({
  id: z.string().nonempty(),
  enabled: z.boolean(),
});

export type Strategy = z.infer<typeof strategySchema>;
