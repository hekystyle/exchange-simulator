import type { Serie } from '@app/common';
import { getBaseApiUrl } from './fetch.js';

export const fetchStats = async (signal: AbortSignal | undefined): Promise<Serie[]> => {
  const url = new URL('/statistics', getBaseApiUrl());
  const response = await fetch(url, { signal: signal ?? null });
  if (!response.ok) throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  return (await response.json()) as Serie[];
};
