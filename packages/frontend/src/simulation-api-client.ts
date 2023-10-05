import { getBaseApiUrl } from './fetch.js';

export const initSimulation = async (): Promise<void> => {
  const url = new URL('/simulation/init', getBaseApiUrl());
  const response = await fetch(url, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to init simulation : ${response.statusText}`);
};

export const startSimulation = async (payload: { speed: number }): Promise<void> => {
  const url = new URL('/simulation/start', getBaseApiUrl());
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Failed to start simulation : ${response.statusText}`);
};

export const stopSimulation = async (): Promise<void> => {
  const url = new URL(`/simulation/stop`, getBaseApiUrl());
  const response = await fetch(url, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to stop simulation : ${response.statusText}`);
};
