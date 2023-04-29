import { Inject } from '@nestjs/common';
import { Exchange, SimulatedExchange } from './SimulatedExchange.js';
import { StrategyDCA } from './StrategyDCA.js';
import { StrategyEnhancedDCA } from './StrategyEnhancedDCA.js';
import { StrategyFNG } from './StrategyFNG.js';

export class Strategies {
  constructor(
    @Inject(SimulatedExchange)
    public readonly exchange: Exchange,
  ) {
    [new StrategyDCA(), new StrategyEnhancedDCA(1), new StrategyFNG()].forEach(strategy =>
      strategy.setup(this.exchange),
    );
  }
}
