import Highcharts from 'highcharts/highstock.js';
import Stock from 'highcharts/modules/stock.js';
import { HighchartsReact } from 'highcharts-react-official';
import type { FC } from 'react';

Stock.default(Highcharts);

export const Chart: FC<{ options: Highcharts.Options }> = ({ options }) => {
  return <HighchartsReact highcharts={Highcharts} options={options} />;
};
