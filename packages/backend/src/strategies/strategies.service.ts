import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import rx from 'rxjs';
import { StrategyDCA } from './strategy-dca.js';
import { StrategyEnhancedDCA } from './strategy-enhanced-dca.js';
import { IStrategy } from './strategy.interface.js';

@Injectable()
export class StrategiesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StrategiesService.name);

  private readonly strategiesMap: Map<string, IStrategy> = new Map();

  constructor(
    @Inject(StrategyDCA)
    private readonly strategyDCA: StrategyDCA,
    @Inject(StrategyEnhancedDCA)
    private readonly strategyEnhancedDCA: StrategyEnhancedDCA,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('Setting up strategies...');

    this.strategiesMap.set(this.strategyDCA.constructor.name, this.strategyDCA);
    this.strategyDCA.setup();

    this.strategiesMap.set(this.strategyEnhancedDCA.constructor.name, this.strategyEnhancedDCA);
    this.strategyEnhancedDCA.setup(1);
  }

  find(): rx.Observable<{ id: string; strategy: IStrategy }> {
    return rx.from(this.strategiesMap.entries()).pipe(rx.map(([id, strategy]) => ({ id, strategy })));
  }

  async findById(id: string): Promise<IStrategy | undefined> {
    return this.strategiesMap.get(id);
  }
}
