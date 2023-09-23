import { useMutation } from '@tanstack/react-query';
import { Switch, notification } from 'antd';
import { useState } from 'react';
import { Strategy } from '@app/common';
import * as StrategiesApiClient from './strategies-api-client.js';

export const StrategySwitch = ({ strategy }: { strategy: Strategy }) => {
  const [enabled, setEnabled] = useState(strategy.enabled);

  const { mutate: mutateEnableStrategy, isLoading: isEnablingStrategy } = useMutation({
    mutationFn: StrategiesApiClient.enableStrategy,
    onSuccess: () => {
      setEnabled(true);
      notification.success({ message: `Strategy ${strategy.id} enabled` });
    },
  });

  const { mutate: mutateDisableStrategy, isLoading: isDisablingStrategy } = useMutation({
    mutationFn: StrategiesApiClient.disableStrategy,
    onSuccess: () => {
      setEnabled(false);
      notification.success({ message: `Strategy ${strategy.id} disabled` });
    },
  });

  return (
    <Switch
      checked={enabled}
      checkedChildren={strategy.id}
      disabled={isEnablingStrategy || isDisablingStrategy}
      loading={isEnablingStrategy || isDisablingStrategy}
      unCheckedChildren={strategy.id}
      onChange={() => {
        if (enabled) {
          mutateDisableStrategy(strategy);
        } else {
          mutateEnableStrategy(strategy);
        }
      }}
    />
  );
};
