import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module.js';
import { OrdersModule } from '../orders/orders.module.js';
import { StatisticsCollector } from './statistics.collector.js';
import { StatisticsController } from './statistics.controller.js';

@Module({
  controllers: [StatisticsController],
  exports: [],
  imports: [OrdersModule, AccountsModule],
  providers: [StatisticsCollector],
})
export class StatisticsModule {}
