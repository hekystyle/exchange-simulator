import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Space, Tabs, notification } from 'antd';
import { FC, Suspense } from 'react';
import { QUERY_KEYS } from './query-keys.js';
import * as simulationApiClient from './simulation-api-client.js';
import { Simulation } from './Simulation.jsx';
import { Strategies } from './Strategies.jsx';

export const App: FC = () => {
  const queryClient = useQueryClient();

  const simulationStatus = useQuery({
    queryKey: QUERY_KEYS.simulation.all,
    queryFn: async ({ signal }) => await simulationApiClient.getState(signal),
  });

  const initSimulation = useMutation({
    mutationFn: simulationApiClient.initSimulation,
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.simulation.all).catch(console.error);
      notification.success({
        message: 'Simulation initialized',
      });
    },
    onError: error => {
      notification.error({
        message: 'Failed to initialize simulation',
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Tabs
        items={[
          {
            key: 'strategies',
            label: 'Strategies',
            children: (
              <Suspense fallback="Loading...">
                <Strategies />
              </Suspense>
            ),
          },
        ]}
      />
      <Button
        disabled={
          simulationStatus.isLoading || simulationStatus.data?.initialized || initSimulation.isLoading
        }
        loading={initSimulation.isLoading}
        type="primary"
        onClick={() => initSimulation.mutate()}
      >
        Init simulation
      </Button>
      <Simulation />
    </Space>
  );
};
