import { useMutation } from '@tanstack/react-query';
import { Switch } from 'antd';
import { useState } from 'react';
import { Strategy } from '@app/common';
import * as strategiesApiClient from './strategies-api-client.js';

export const StrategySwitch = ({ strategy }: { strategy: Strategy }) => {
  const [enabled, setEnabled] = useState(strategy.enabled);

  const { mutate: mutateEnableStrategy, isLoading: isEnablingStrategy } = useMutation({
    mutationFn: strategiesApiClient.enableStrategy,
    onSuccess: () => setEnabled(true),
  });

  const { mutate: mutateDisableStrategy, isLoading: isDisablingStrategy } = useMutation({
    mutationFn: strategiesApiClient.disableStrategy,
    onSuccess: () => setEnabled(false),
  });

  return (
    <Switch
      onChange={() => {
        if (enabled) {
          mutateDisableStrategy(strategy);
        } else {
          mutateEnableStrategy(strategy);
        }
      }}
      disabled={isEnablingStrategy || isDisablingStrategy}
      checked={enabled}
      loading={isEnablingStrategy || isDisablingStrategy}
      checkedChildren={strategy.id}
      unCheckedChildren={strategy.id}
    />
  );
};
