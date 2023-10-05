import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import type { Metadata, Serie, Source } from '@app/common';
import { Chart } from './components/Chart.jsx';
import { getBaseApiUrl } from './fetch.js';
import type { SeriesLineOptions } from 'highcharts';

const fetchStats = async (signal?: AbortSignal): Promise<Serie[]> => {
  const url = new URL('/statistics', getBaseApiUrl());
  const response = await fetch(url, { signal: signal ?? null });
  if (!response.ok) throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  return (await response.json()) as Serie[];
};

const TRANSLATED_SOURCE = {
  wallet: 'Wallet balance',
  orders: 'Opened orders',
} as const satisfies Record<Source, string>;

const getSerieName = (meta: Metadata): string => {
  return [TRANSLATED_SOURCE[meta.source], `[${meta.unit}]`, `[${meta.owner}]`].join(' ');
};

export const StatsChart: FC = () => {
  const { data, refetch } = useQuery<Serie[]>({
    queryKey: ['statistics'],
    queryFn: async ({ signal }) => await fetchStats(signal),
    suspense: true,
  });

  const handleRefreshButtonClick = () => {
    refetch().catch(error => console.error(error));
  };

  useEffect(() => {
    const eventSource = new EventSource(new URL('/simulation/sse', getBaseApiUrl()));
    eventSource.onerror = console.error;
    eventSource.addEventListener('simulation.finished', () => {
      refetch().catch(error => console.error(error));
    });
    return () => eventSource.close();
  }, [refetch]);

  return (
    <>
      <button type="button" onClick={handleRefreshButtonClick}>
        Refresh
      </button>
      <Chart
        options={{
          accessibility: {
            enabled: false,
          },
          title: {
            text: 'Statistics',
          },
          tooltip: {
            shared: true,
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
          series: (data ?? []).map<SeriesLineOptions>(({ data: points, meta }) => ({
            type: 'line',
            name: getSerieName(meta),
            yAxis: meta.unit,
            data: points,
            tooltip: {
              valueDecimals: meta.unit === 'BTC' ? 8 : 2,
            },
          })),
        }}
      />
    </>
  );
};
