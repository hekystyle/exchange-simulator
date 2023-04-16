import { Inject } from '@nestjs/common';
import { Exchange, SimulatedExchange } from './SimulatedExchange.js';
import { StrategyDCA } from './StrategyDCA.js';

type X = number;
type Y = number;

interface Point {
  x: X;
  y: Y;
}

interface Serie {
  id: string;
  data: Point[];
}

export class StatisticsCollector {
  private DCA_BTC: Serie = { id: 'DCA BTC', data: [] };

  private DCA_EUR: Serie = { id: 'DCA EUR', data: [] };

  constructor(
    @Inject(SimulatedExchange)
    private readonly exchange: Exchange,
  ) {
    this.setup();
  }

  setup(): this {
    this.exchange.on('dayClosed', (sender, date) => {
      this.DCA_BTC.data.push({
        x: sender.accounts.get(StrategyDCA.name).BTC.balance,
        y: date.getTime(),
      });
      this.DCA_EUR.data.push({
        x: sender.accounts.get(StrategyDCA.name).EUR.balance,
        y: date.getTime(),
      });
    });
    return this;
  }

  getSeries() {
    return [this.DCA_BTC, this.DCA_EUR];
  }
}
