import { useMutation } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { MarketChart } from './MarketChart.jsx';
import * as simulationApiClient from './simulation-api-client.js';
import { StatsChart } from './StatsChart.jsx';

export const Simulation = () => {
  const [speed, setSpeed] = useState(50);

  const { mutate: mutateStartSimulation, isLoading: isStartingSimulation } = useMutation({
    mutationFn: simulationApiClient.startSimulation,
  });

  const { mutate: mutateInitSimulation, isLoading: isInitializingSimulation } = useMutation({
    mutationFn: simulationApiClient.initSimulation,
    onSuccess: () => mutateStartSimulation({ speed }),
  });

  const { mutate: mutateStopSimulation, isLoading: isStoppingSimulation } = useMutation({
    mutationFn: simulationApiClient.stopSimulation,
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
