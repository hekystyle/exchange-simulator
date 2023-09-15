import { useMutation } from '@tanstack/react-query';
import { Switch } from 'antd';
import { useState } from 'react';
import { Strategy } from '@app/common';
import { getBaseApiUrl } from './fetch.js';

const enableStrategy = async ({ id }: Strategy): Promise<void> => {
  const url = new URL(`/strategies/enable`, getBaseApiUrl());
  url.searchParams.append('id', id);
  const response = await fetch(url, { method: 'PUT' });
  if (!response.ok) throw new Error(`Failed to enable strategy : ${response.statusText}`);
};

const disableStrategy = async ({ id }: Strategy): Promise<void> => {
  const url = new URL(`/strategies/disable`, getBaseApiUrl());
  url.searchParams.append('id', id);
  const response = await fetch(url, { method: 'PUT' });
  if (!response.ok) throw new Error(`Failed to disable strategy : ${response.statusText}`);
};

export const StrategySwitch = ({ strategy }: { strategy: Strategy }) => {
  const [enabled, setEnabled] = useState(strategy.enabled);

  const { mutate: mutateEnableStrategy, isLoading: isEnablingStrategy } = useMutation({
    mutationFn: enableStrategy,
    onSuccess: () => setEnabled(true),
  });

  const { mutate: mutateDisableStrategy, isLoading: isDisablingStrategy } = useMutation({
    mutationFn: disableStrategy,
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
