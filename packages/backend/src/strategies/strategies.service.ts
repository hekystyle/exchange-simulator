import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { StrategyDCA } from './strategy-dca.js';
import { StrategyEnhancedDCA } from './strategy-enhanced-dca.js';

@Injectable()
export class StrategiesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StrategiesService.name);

  constructor(
    @Inject(StrategyDCA)
    private readonly strategyDCA: StrategyDCA,
    @Inject(StrategyEnhancedDCA)
    private readonly strategyEnhancedDCA: StrategyEnhancedDCA,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('Setting up strategies...');
    this.strategyDCA.setup();
    this.strategyEnhancedDCA.setup(1);
  }
}
