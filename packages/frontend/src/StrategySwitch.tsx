import { useMutation } from '@tanstack/react-query';
import { Switch, notification } from 'antd';
import { useState } from 'react';
import { Strategy } from '@app/common';
import * as strategiesApiClient from './strategies-api-client.js';

export const StrategySwitch = ({ strategy }: { strategy: Strategy }) => {
  const [enabled, setEnabled] = useState(strategy.enabled);

  const enableStrategy = useMutation({
    mutationFn: strategiesApiClient.enableStrategy,
    onSuccess: () => {
      setEnabled(true);
      notification.success({
        key: `strategy-enabled-${strategy.id}`,
        message: `Strategy ${strategy.id} enabled`,
      });
    },
    onError: error => {
      notification.error({
        message: `Failed to enable strategy ${strategy.id}`,
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const disableStrategy = useMutation({
    mutationFn: strategiesApiClient.disableStrategy,
    onSuccess: () => {
      setEnabled(false);
      notification.success({
        key: `strategy-disabled-${strategy.id}`,
        message: `Strategy ${strategy.id} disabled`,
      });
    },
    onError: error => {
      notification.error({
        message: `Failed to disable strategy ${strategy.id}`,
        description: error instanceof Error ? error.message : undefined,
      });
    },
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
