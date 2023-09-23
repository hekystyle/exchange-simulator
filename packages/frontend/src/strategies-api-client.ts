import { Strategy, strategySchema } from '@app/common';
import { getBaseApiUrl } from './fetch.js';

export const fetchStrategies = async (signal: AbortSignal | null | undefined = null): Promise<Strategy[]> => {
  const url = new URL('/strategies', getBaseApiUrl());

  const response = await fetch(url, { signal });

  if (!response.ok) throw new Error(`Failed to fetch strategies : ${response.statusText}`);

  const data: unknown = await response.json();

  return strategySchema.array().parse(data);
};

export const enableStrategy = async ({ id }: Strategy): Promise<void> => {
  const url = new URL(`/strategies/enable`, getBaseApiUrl());

  url.searchParams.append('id', id);

  const response = await fetch(url, { method: 'PUT' });

  if (!response.ok) throw new Error(`Failed to enable strategy : ${response.statusText}`);
};

export const disableStrategy = async ({ id }: Strategy): Promise<void> => {
  const url = new URL(`/strategies/disable`, getBaseApiUrl());

  url.searchParams.append('id', id);

  const response = await fetch(url, { method: 'PUT' });

  if (!response.ok) throw new Error(`Failed to disable strategy : ${response.statusText}`);
};
