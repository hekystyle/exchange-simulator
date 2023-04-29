import { Controller, Get, Inject } from '@nestjs/common';
import { StatisticsCollector } from './StatisticsCollector.js';

@Controller('statistics')
export class StatisticsController {
  constructor(
    @Inject(StatisticsCollector)
    private readonly collector: StatisticsCollector,
  ) {}

  @Get()
  getSeries() {
    return this.collector.getSeries();
  }
}
