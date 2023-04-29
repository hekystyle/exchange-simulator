import { useQuery } from '@tanstack/react-query';
import { Chart } from './Chart.jsx';
import type { Metadata, Serie, Source } from '@exchange-simulator/common';
import type { SeriesLineOptions } from 'highcharts';
import type { FC } from 'react';

const getBaseApiUrl = (): URL => {
  const url = new URL(window.location.href);
  url.port = '3000';
  return url;
};

const fetchStats = async (signal?: AbortSignal): Promise<Serie[]> => {
  const url = new URL('/statistics', getBaseApiUrl());
  const response = await fetch(url, { signal: signal ?? null });
  if (!response.ok) throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  return (await response.json()) as Serie[];
};

const TRANSLATED_SOURCE = {
  wallet: 'Wallet balance',
  orders: 'Opened orders',
  'fear-and-greed-index': 'Fear and Greed Index',
} as const satisfies Record<Source, string>;

const getSerieName = (meta: Metadata): string => {
  let name = TRANSLATED_SOURCE[meta.source];
  if (meta.unit) name += ` [${meta.unit}]`;
  if (meta.owner) name += ` [${meta.owner}]`;
  return name;
};

export const StatsChart: FC = () => {
  const { data, refetch } = useQuery<Serie[]>(['statistics'], async ({ signal }) => await fetchStats(signal), {
    suspense: true,
  });
  const handleRefreshButtonClick = () => {
    refetch().catch(error => console.error(error));
  };
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
            {
              id: '%',
              title: {
                text: '%',
              },
              min: 0,
              max: 100,
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
