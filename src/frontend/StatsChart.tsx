import { useQuery } from '@tanstack/react-query';
import { Chart } from './Chart.jsx';
import type { Serie } from '../StatisticsCollector.js';
import type { SeriesLineOptions } from 'highcharts';
import type { FC } from 'react';

const fetchStats = async (signal?: AbortSignal): Promise<Serie[]> => {
  const url = new URL('/statistics', window.location.href);
  url.port = '3000';
  const response = await fetch(url, { signal: signal ?? null });
  if (!response.ok) throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  return (await response.json()) as Serie[];
};

export const StatsChart: FC = () => {
  const { data } = useQuery<Serie[]>(['statistics'], async ({ signal }) => await fetchStats(signal), {
    suspense: true,
  });
  return (
    <Chart
      options={{
        accessibility: {
          enabled: false,
        },
        title: {
          text: 'Statistics',
        },
        xAxis: {
          type: 'datetime',
          labels: {
            format: '{value:%Y-%m-%d}',
          },
        },
        yAxis: [
          {
            id: 'EUR',
            title: {
              text: 'EUR',
            },
          },
          {
            id: 'BTC',
            title: {
              text: 'BTC',
            },
          },
        ],
        series: (data ?? []).map<SeriesLineOptions>(serie => ({
          type: 'line',
          name: `${serie.meta.currency} [${serie.meta.owner}]`,
          yAxis: serie.meta.currency,
          data: serie.data,
        })),
      }}
    />
  );
};
