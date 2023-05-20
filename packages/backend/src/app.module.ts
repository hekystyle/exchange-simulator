import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Accounts } from './Accounts.js';
import { Markets } from './Markets.js';
import { Orders } from './Orders.js';
import { SimulatedExchange } from './SimulatedExchange.js';
import { StatisticsController } from './statistics.controller.js';
import { StatisticsCollector } from './StatisticsCollector.js';
import { Strategies } from './strategies.service.js';
import { StrategyDCA } from './StrategyDCA.js';
import { StrategyEnhancedDCA } from './StrategyEnhancedDCA.js';

@Module({
  controllers: [StatisticsController],
  exports: [],
  imports: [EventEmitterModule.forRoot({ global: true })],
  providers: [
    Accounts,
    Markets,
    Orders,
    SimulatedExchange,
    StatisticsCollector,
    Strategies,
    StrategyDCA,
    StrategyEnhancedDCA,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- NestJS module
export class AppModule {}
