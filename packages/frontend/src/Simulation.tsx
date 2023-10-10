import { useMutation } from '@tanstack/react-query';
import { Button, Input } from 'antd';
import { Suspense, useState } from 'react';
import { MarketChart } from './MarketChart.jsx';
import * as simulationApiClient from './simulation-api-client.js';
import { StatsChart } from './StatsChart.jsx';

export const Simulation = () => {
  const [speed, setSpeed] = useState(50);

  const runSimulation = useMutation({
    mutationFn: simulationApiClient.runSimulation,
  });

  const pauseSimulation = useMutation({
    mutationFn: simulationApiClient.pauseSimulation,
  });

  return (
    <>
      <Button
        disabled={runSimulation.isLoading}
        type="primary"
        onClick={() => runSimulation.mutate({ speed })}
      >
        Run simulation
      </Button>
      <Input
        style={{ width: 'unset' }}
        type="number"
        value={speed}
        onChange={e => setSpeed(parseInt(e.target.value, 10))}
      />
      <Button disabled={pauseSimulation.isLoading} type="primary" onClick={() => pauseSimulation.mutate()}>
        Pause simulation
      </Button>
      <MarketChart />
      <Suspense fallback="Loading...">
        <StatsChart />
      </Suspense>
    </>
  );
};
