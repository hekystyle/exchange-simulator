import { Tabs } from 'antd';
import { FC, Suspense } from 'react';
import { Simulation } from './Simulation.jsx';
import { Strategies } from './Strategies.jsx';

export const App: FC = () => {
  return (
    <>
      <Tabs
        items={[
          {
            key: 'strategies',
            label: 'Strategies',
            children: (
              <Suspense fallback="Loading...">
                <Strategies />
              </Suspense>
            ),
          },
        ]}
      />
      <Simulation />
    </>
  );
};
