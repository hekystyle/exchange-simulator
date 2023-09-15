import { useQuery } from '@tanstack/react-query';
import { Space } from 'antd';
import { Strategy, strategySchema } from '@app/common';
import { getBaseApiUrl } from './fetch.js';
import { StrategySwitch } from './StrategySwitch.jsx';

const fetchStrategies = async (): Promise<Strategy[]> => {
  const url = new URL('/strategies', getBaseApiUrl());
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch strategies : ${response.statusText}`);
  const data: unknown = await response.json();
  return strategySchema.array().parse(data);
};

export const Strategies = () => {
  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: fetchStrategies,
    suspense: true,
  });

  return (
    <Space direction="horizontal">
      {(strategies ?? []).map(s => (
        <StrategySwitch key={s.id} strategy={s} />
      ))}
    </Space>
  );
};
