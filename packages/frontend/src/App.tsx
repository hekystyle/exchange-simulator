import { Tabs } from 'antd';
import { FC, Suspense } from 'react';
import { Simulation } from './Simulation.jsx';
import { Strategies } from './Strategies.jsx';

export const App: FC = () => {
  return (
    <>
      <Tabs>
        <Tabs.TabPane tab="Strategies" key="market">
          <Suspense fallback="Loading...">
            <Strategies />
          </Suspense>
        </Tabs.TabPane>
      </Tabs>
      <Simulation />
    </>
  );
};
