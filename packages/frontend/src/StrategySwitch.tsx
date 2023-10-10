import { useMutation } from '@tanstack/react-query';
import { Switch } from 'antd';
import { useState } from 'react';
import { Strategy } from '@app/common';
import * as strategiesApiClient from './strategies-api-client.js';

export const StrategySwitch = ({ strategy }: { strategy: Strategy }) => {
  const [enabled, setEnabled] = useState(strategy.enabled);

  const enableStrategy = useMutation({
    mutationFn: strategiesApiClient.enableStrategy,
    onSuccess: () => setEnabled(true),
  });

  const disableStrategy = useMutation({
    mutationFn: strategiesApiClient.disableStrategy,
    onSuccess: () => setEnabled(false),
  });

  return (
    <Switch
      onChange={() => {
        if (enabled) {
          disableStrategy.mutate(strategy);
        } else {
          enableStrategy.mutate(strategy);
        }
      }}
      disabled={enableStrategy.isLoading || disableStrategy.isLoading}
      checked={enabled}
      loading={enableStrategy.isLoading || disableStrategy.isLoading}
      checkedChildren={strategy.id}
      unCheckedChildren={strategy.id}
    />
  );
};
