import { Inject } from '@nestjs/common';
import { StrategyDCA } from './StrategyDCA.js';
import { StrategyEnhancedDCA } from './StrategyEnhancedDCA.js';

export class Strategies {
  constructor(
    @Inject(StrategyDCA)
    strategyDCA: StrategyDCA,
    @Inject(StrategyEnhancedDCA)
    strategyEnhancedDCA: StrategyEnhancedDCA,
  ) {
    strategyDCA.setup();
    strategyEnhancedDCA.setup(1);
  }
}
