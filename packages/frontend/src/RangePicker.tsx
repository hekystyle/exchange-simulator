import { useQuery } from '@tanstack/react-query';
import { DatePicker, Form } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker/index.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';
import { useEffect } from 'react';
import * as CandlesApiClient from './candles-api-client.js';
import { FormValues } from './Form.jsx';

dayjs.extend(isBetween);

export const RangePicker = (props: RangePickerProps) => {
  const form = Form.useFormInstance<FormValues>();
  const market = Form.useWatch(['market'], form);
  const interval = Form.useWatch(['interval'], form);

  const { data: range, isLoading } = useQuery({
    queryKey: ['candles', 'range', { symbol: market, interval }],
    queryFn: ({ signal }) => CandlesApiClient.range({ symbol: market, interval }, signal),
    enabled: !!market && !!interval,
    meta: {
      errorMessage: 'Failed to fetch candles range',
    },
  });

  useEffect(() => {
    if (range && !form.getFieldValue('range'))
      form.setFieldsValue({ range: [dayjs(range.from), dayjs(range.to)] });
  }, [form, range]);

  return (
    <DatePicker.RangePicker
      disabled={isLoading}
      disabledDate={date => !!range && !date.isBetween(range.from, range.to)}
      picker="date"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};
