import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountsModule } from './accounts/accounts.module.js';
import { MarketsModule } from './markets/markets.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { SimulatedExchange } from './simulated-exchange.js';
import { SimulationController } from './simulation.controller.js';
import { StatisticsCollector } from './statistics/statistics.collector.js';
import { StatisticsModule } from './statistics/statistics.module.js';
import { StrategiesModule } from './strategies/strategies.module.js';
import { StrategyDCA } from './strategies/strategy-dca.js';
import { StrategyEnhancedDCA } from './strategies/strategy-enhanced-dca.js';

@Module({
  controllers: [SimulationController],
  exports: [],
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    AccountsModule,
    MarketsModule,
    OrdersModule,
    StatisticsModule,
    StrategiesModule,
  ],
  providers: [SimulatedExchange, StatisticsCollector, StrategyDCA, StrategyEnhancedDCA],
})
export class AppModule {}
