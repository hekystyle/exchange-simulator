import { Inject } from '@nestjs/common';
import { Exchange, SimulatedExchange } from './SimulatedExchange.js';
import { StrategyDCA } from './StrategyDCA.js';

type X = number;
type Y = number;

interface Point {
  x: X;
  y: Y;
}

interface Metadata {
  owner: string;
  currency: string;
}

export interface Serie {
  meta: Metadata;
  data: Point[];
}

export class StatisticsCollector {
  private DCA_BTC: Serie = { meta: { owner: 'DCA', currency: 'BTC' }, data: [] };

  private DCA_EUR: Serie = { meta: { owner: 'DCA', currency: 'EUR' }, data: [] };

  constructor(
    @Inject(SimulatedExchange)
    private readonly exchange: Exchange,
  ) {
    this.setup();
  }

  setup(): this {
    this.exchange.on('dayClosed', (sender, date) => {
      this.DCA_BTC.data.push({
        x: date.getTime(),
        y: sender.accounts.get(StrategyDCA.name).BTC.balance,
      });
      this.DCA_EUR.data.push({
        x: date.getTime(),
        y: sender.accounts.get(StrategyDCA.name).EUR.balance,
      });
    });
    return this;
  }

  getSeries() {
    return [this.DCA_BTC, this.DCA_EUR];
  }
}
