import { Module } from '@nestjs/common';
import { SimulatedExchange } from './SimulatedExchange.js';
import { StatisticsController } from './statistics.controller.js';
import { StatisticsCollector } from './StatisticsCollector.js';
import { Strategies } from './strategies.service.js';

@Module({
  controllers: [StatisticsController],
  exports: [],
  imports: [],
  providers: [SimulatedExchange, Strategies, StatisticsCollector],
})
export class AppModule {}
