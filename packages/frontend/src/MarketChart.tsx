import { PointOptionsObject } from 'highcharts';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Chart } from './Chart.jsx';
import { getBaseApiUrl } from './fetch.js';

const Candle = z.object({
  date: z
    .string()
    .datetime()
    .transform(value => new Date(value)),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
});

export const MarketChart = () => {
  const [data, setData] = useState<PointOptionsObject[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(new URL('/simulation/sse', getBaseApiUrl()));
    eventSource.onerror = console.error;
    eventSource.addEventListener('simulation.tick', event => {
      const candle = Candle.parse(JSON.parse(z.string().parse(event.data)));
      setData(prevData => [
        ...prevData,
        {
          x: candle.date.getTime(),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        },
      ]);
    });
    return () => eventSource.close();
  }, []);

  return (
    <Chart
      options={{
        accessibility: {
          enabled: false,
        },
        title: {
          text: 'Market',
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
        ],
        series: [
          {
            type: 'candlestick',
            name: 'BTC/EUR',
            data,
          },
        ],
      }}
    />
  );
};
