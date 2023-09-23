import { useQuery } from '@tanstack/react-query';
import { Space } from 'antd';
import * as StrategiesApiClient from './strategies-api-client.js';
import { StrategySwitch } from './StrategySwitch.jsx';

export const Strategies = () => {
  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: async ({ signal }) => await StrategiesApiClient.fetchStrategies(signal),
    suspense: true,
    meta: {
      errorMessage: 'Failed to fetch strategies',
    },
  });

  return (
    <Space direction="horizontal">
      {(strategies ?? []).map(s => (
        <StrategySwitch key={s.id} strategy={s} />
      ))}
    </Space>
  );
};
