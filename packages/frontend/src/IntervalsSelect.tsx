import { useQuery } from '@tanstack/react-query';
import { Form, Select, SelectProps } from 'antd';
import { useEffect } from 'react';
import * as CandlesApiClient from './candles-api-client.js';
import { FormValues } from './Form.jsx';

export const IntervalsSelect = (props: Omit<SelectProps, 'loading' | 'options'>) => {
  const form = Form.useFormInstance<FormValues>();
  const market = Form.useWatch(['market'], form);

  const { data: candles, isLoading } = useQuery({
    queryKey: ['candles', { distinct: 'interval', market }],
    queryFn: ({ signal }) =>
      CandlesApiClient.find({ symbol: market, distinct: 'interval', select: 'interval' }, signal),
    enabled: !!market,
    meta: {
      errorMessage: 'Failed to fetch candles intervals',
    },
  });

  useEffect(() => {
    if (candles?.length === 1 && !form.getFieldValue('interval'))
      form.setFieldsValue({ interval: candles?.[0]?.interval });
  }, [form, candles]);

  return (
    <Select
      disabled={isLoading}
      loading={isLoading}
      options={(candles ?? []).map(c => ({
        label: c.interval ?? '',
        value: c.interval ?? '',
      }))}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};
