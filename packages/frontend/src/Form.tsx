import { Button, Form } from 'antd';
import { IntervalsSelect } from './IntervalsSelect.jsx';
import { MarketSelect } from './MarketsSelect.jsx';
import { RangePicker } from './RangePicker.jsx';
import { useSimulationStatus } from './useSimulationStatus.js';

export interface FormValues {
  market: string | undefined;
  interval: number | undefined;
  range: [Date, Date];
}

export const CONFIGURATION_FORM = 'configuration-form';

export interface ConfigurationFormProps {
  loading: boolean;
  onSubmit: (values: FormValues) => void;
}

export const ConfigurationForm = ({ loading, onSubmit }: ConfigurationFormProps) => {
  const { data: { configured } = {} } = useSimulationStatus();

  return (
    <Form id={CONFIGURATION_FORM} onFinish={onSubmit}>
      <Form.Item required label="Market" name="market" rules={[{ required: true }]}>
        <MarketSelect allowClear />
      </Form.Item>
      <Form.Item required label="Interval" name="interval" rules={[{ required: true }]}>
        <IntervalsSelect allowClear />
      </Form.Item>
      <Form.Item required label="Range" name="range" rules={[{ required: true }]}>
        <RangePicker />
      </Form.Item>
      <Button
        disabled={configured ?? false}
        form={CONFIGURATION_FORM}
        htmlType="submit"
        loading={loading}
        type="primary"
      >
        Start simulation
      </Button>
    </Form>
  );
};
