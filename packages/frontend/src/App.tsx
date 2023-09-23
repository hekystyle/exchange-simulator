import { useMutation } from '@tanstack/react-query';
import { Button, Form, InputNumber, Space, Tabs } from 'antd';
import { FC, Suspense, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { SimulationConfiguration } from './Configuration.jsx';
import { MarketChart } from './MarketChart.jsx';
import * as SimulationApiClient from './simulation-api-client.js';
import { StatsChart } from './StatsChart.jsx';

export const SimulationControlPanel = () => {
  const [speed, setSpeed] = useState(50);

  const { mutate: mutateStartSimulation, isLoading: isStartingSimulation } = useMutation({
    mutationFn: SimulationApiClient.startSimulation,
  });

  const { mutate: mutateStopSimulation, isLoading: isStoppingSimulation } = useMutation({
    mutationFn: SimulationApiClient.stopSimulation,
  });

  return (
    <>
      <Form.Item help="Speed of simulation in milliseconds" label="Speed">
        <InputNumber value={speed} onChange={value => value && setSpeed(value)} />
      </Form.Item>
      <Space size={8}>
        <Button disabled={isStartingSimulation} onClick={() => mutateStartSimulation({ speed })}>
          Start simulation
        </Button>
        <Button disabled={isStoppingSimulation} onClick={() => mutateStopSimulation()}>
          Stop simulation
        </Button>
      </Space>
      <MarketChart />
      <Suspense fallback="Loading...">
        <StatsChart />
      </Suspense>
    </>
  );
};

export const AppTabs = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  return (
    <Tabs
      activeKey={tab ?? 'configuration'}
      items={[
        {
          key: 'configuration',
          label: 'Configuration',
          children: <SimulationConfiguration />,
        },
        {
          key: 'control-panel',
          label: 'Control panel',
          children: <SimulationControlPanel />,
        },
      ]}
      onTabClick={key => navigate(`../${key}`)}
    />
  );
};

export const App: FC = () => {
  return (
    <Routes>
      <Route element={<Navigate to="configuration" />} path="/" />
      <Route element={<AppTabs />} path=":tab/*" />
    </Routes>
  );
};
