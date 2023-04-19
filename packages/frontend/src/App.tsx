import { FC, Suspense } from 'react';
import { StatsChart } from './StatsChart.jsx';

export const App: FC = () => {
  return (
    <Suspense fallback="Loading...">
      <StatsChart />
    </Suspense>
  );
};
