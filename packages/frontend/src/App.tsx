import { useMutation } from '@tanstack/react-query';
import { FC, Suspense, useState } from 'react';
import { getBaseApiUrl } from './fetch.js';
import { MarketChart } from './MarketChart.jsx';
import { StatsChart } from './StatsChart.jsx';

const initSimulation = async (): Promise<void> => {
  const url = new URL('/simulation/init', getBaseApiUrl());
  const response = await fetch(url, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to init simulation : ${response.statusText}`);
};

const startSimulation = async (payload: { speed: number }): Promise<void> => {
  const url = new URL('/simulation/start', getBaseApiUrl());
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Failed to start simulation : ${response.statusText}`);
};

const stopSimulation = async (): Promise<void> => {
  const url = new URL(`/simulation/stop`, getBaseApiUrl());
  const response = await fetch(url, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to stop simulation : ${response.statusText}`);
};

export const App: FC = () => {
  const [speed, setSpeed] = useState(50);

  const { mutate: mutateStartSimulation, isLoading: isStartingSimulation } = useMutation({
    mutationFn: startSimulation,
  });

  const { mutate: mutateInitSimulation, isLoading: isInitializingSimulation } = useMutation({
    mutationFn: initSimulation,
    onSuccess: () => mutateStartSimulation({ speed }),
  });

  const { mutate: mutateStopSimulation, isLoading: isStoppingSimulation } = useMutation({
    mutationFn: stopSimulation,
  });

  return (
    <>
      <button type="button" onClick={() => mutateInitSimulation()} disabled={isInitializingSimulation}>
        Init simulation
      </button>
      <button type="button" onClick={() => mutateStartSimulation({ speed })} disabled={isStartingSimulation}>
        Start simulation
      </button>
      <input type="number" value={speed} onChange={e => setSpeed(parseInt(e.target.value, 10))} />
      <button type="button" onClick={() => mutateStopSimulation()} disabled={isStoppingSimulation}>
        Stop simulation
      </button>
      <MarketChart />
      <Suspense fallback="Loading...">
        <StatsChart />
      </Suspense>
    </>
  );
};
