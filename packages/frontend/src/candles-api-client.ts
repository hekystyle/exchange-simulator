import { z } from 'zod';
import { getBaseApiUrl } from './fetch.js';

export interface CandlesFilter {
  symbol?: string | undefined;
  interval?: number | undefined;
  distinct?: 'symbol' | 'interval';
  select?: 'symbol' | 'interval';
}

const candle = z
  .object({
    symbol: z.string(),
    interval: z.number(),
  })
  .partial();

export type Candle = z.infer<typeof candle>;

const rangeSchema = z
  .object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  })
  .strict();

export type Range = z.infer<typeof rangeSchema>;

export async function find(
  filter: CandlesFilter,
  signal: AbortSignal | null | undefined = null,
): Promise<Candle[]> {
  const url = new URL('/candles', getBaseApiUrl());

  if (filter.distinct) url.searchParams.set('distinct', filter.distinct);
  if (filter.select) url.searchParams.set('select', filter.select);

  const response = await fetch(url, { signal });

  if (!response.ok) throw new Error(response.statusText);

  const data: unknown = await response.json();

  return candle.array().parse(data);
}

export async function range(
  filter: CandlesFilter,
  signal: AbortSignal | null | undefined = null,
): Promise<Range> {
  const url = new URL(`/candles/range`, getBaseApiUrl());

  if (filter.symbol) url.searchParams.set('symbol', filter.symbol);
  if (filter.interval) url.searchParams.set('interval', filter.interval.toString());

  const response = await fetch(url, { signal });

  if (!response.ok) throw new Error(response.statusText);

  const data: unknown = await response.json();

  return rangeSchema.parse(data);
}
