import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import type { FC } from 'react';

export const Chart: FC<{ options: Highcharts.Options }> = ({ options }) => {
  return <HighchartsReact highcharts={Highcharts} options={options} />;
};
