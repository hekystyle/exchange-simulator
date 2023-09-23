import { z } from 'zod';
import { Range } from '@app/common';
import { getBaseApiUrl } from './fetch.js';

export const simulationSchema = z.object({
  configured: z.boolean(),
});

export type Simulation = z.infer<typeof simulationSchema>;

export const fetchSimulation = async (signal: AbortSignal | null | undefined = null): Promise<Simulation> => {
  const url = new URL('simulation', getBaseApiUrl());
  const response = await fetch(url, {
    method: 'GET',
    signal,
  });

  if (!response.ok) throw new Error(response.statusText);

  const data: unknown = await response.json();

  return simulationSchema.parse(data);
};

export interface ConfigureSimulationDto {
  symbol: string | undefined;
  interval: number | undefined;
  range: Range<Date | string>;
}

export const configureSimulation = async (payload: ConfigureSimulationDto): Promise<void> => {
  const url = new URL('/simulation/configure', getBaseApiUrl());

  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error(`Failed to configure simulation : ${response.statusText}`);
};

export const startSimulation = async (payload: { speed: number }): Promise<void> => {
  const url = new URL('/simulation/start', getBaseApiUrl());
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Failed to start simulation : ${response.statusText}`);
};

export const stopSimulation = async (): Promise<void> => {
  const url = new URL(`/simulation/stop`, getBaseApiUrl());
  const response = await fetch(url, { method: 'PUT' });
  if (!response.ok) throw new Error(`Failed to stop simulation : ${response.statusText}`);
};
