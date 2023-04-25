import { Module } from '@nestjs/common';
import { Accounts } from './Accounts.js';
import { Markets } from './Markets.js';
import { SimulatedExchange } from './SimulatedExchange.js';
import { StatisticsController } from './statistics.controller.js';
import { StatisticsCollector } from './StatisticsCollector.js';
import { Strategies } from './strategies.service.js';

@Module({
  controllers: [StatisticsController],
  exports: [],
  imports: [],
  providers: [Accounts, Markets, SimulatedExchange, StatisticsCollector, Strategies],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- NestJS module
export class AppModule {}
