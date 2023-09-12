import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module.js';
import { OrdersModule } from '../orders/orders.module.js';
import { StrategiesController } from './strategies.controller.js';
import { StrategiesService } from './strategies.service.js';
import { StrategyDCA } from './strategy-dca.js';
import { StrategyEnhancedDCA } from './strategy-enhanced-dca.js';

@Module({
  providers: [StrategyDCA, StrategyEnhancedDCA, StrategiesService],
  exports: [],
  imports: [AccountsModule, OrdersModule],
  controllers: [StrategiesController],
})
export class StrategiesModule {}
