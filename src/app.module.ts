import { Module } from '@nestjs/common';
import { Markets } from './Markets.js';
import { SimulatedExchange } from './SimulatedExchange.js';
import { StatisticsController } from './statistics.controller.js';
import { StatisticsCollector } from './StatisticsCollector.js';
import { Strategies } from './strategies.service.js';

@Module({
  controllers: [StatisticsController],
  exports: [],
  imports: [],
  providers: [SimulatedExchange, Markets, Strategies, StatisticsCollector],
})
export class AppModule {}
