import { useMutation } from '@tanstack/react-query';
import { Card, Col, Row } from 'antd';
import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigurationForm, ConfigurationFormProps } from './Form.jsx';
import * as SimulationApiClient from './simulation-api-client.js';
import { Strategies } from './Strategies.jsx';

export const SimulationConfiguration = () => {
  const navigate = useNavigate();

  const { mutate: configureSimulation, isLoading } = useMutation({
    mutationFn: SimulationApiClient.configureSimulation,
  });

  const handleFormSubmit: ConfigurationFormProps['onSubmit'] = values => {
    configureSimulation(
      {
        ...values,
        symbol: values.market,
        interval: values.interval,
        range: {
          from: values.range[0],
          to: values.range[1],
        },
      },
      {
        onSuccess: () => {
          navigate('/control-panel');
        },
      },
    );
  };

  return (
    <Row gutter={[16, 16]}>
      <Col md={12} xs={24}>
        <Card bodyStyle={{ overflow: 'auto' }} style={{ width: '100%' }}>
          <ConfigurationForm loading={isLoading} onSubmit={handleFormSubmit} />
        </Card>
      </Col>
      <Col md={12} xs={24}>
        <Card bodyStyle={{ overflow: 'auto' }} title="Strategies">
          <Suspense fallback="Loading...">
            <Strategies />
          </Suspense>
        </Card>
      </Col>
    </Row>
  );
};
