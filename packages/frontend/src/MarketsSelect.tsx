import { useQuery } from '@tanstack/react-query';
import { Form, Select, SelectProps } from 'antd';
import { useEffect } from 'react';
import * as CandlesApiClient from './candles-api-client.js';
import { FormValues } from './Form.jsx';

export const MarketSelect = (props: Omit<SelectProps, 'loading' | 'options'>) => {
  const form = Form.useFormInstance<FormValues>();

  const { data: candles, isLoading } = useQuery({
    queryKey: ['markets', { distinct: 'symbol' }],
    queryFn: ({ signal }) => CandlesApiClient.find({ distinct: 'symbol' }, signal),
    meta: {
      errorMessage: 'Failed to fetch markets',
    },
  });

  useEffect(() => {
    if (candles?.length === 1 && !form.getFieldValue('market'))
      form.setFieldsValue({ market: candles?.[0]?.symbol });
  }, [form, candles]);

  return (
    <Select
      loading={isLoading}
      options={(candles ?? []).map(c => ({
        label: c.symbol ?? '',
        value: c.symbol ?? '',
      }))}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};
