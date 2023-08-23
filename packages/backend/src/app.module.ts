import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Accounts } from './Accounts.js';
import { CandlesImporter } from './candles.importer.js';
import { Markets } from './Markets.js';
import { Orders } from './Orders.js';
import { prismaProvider } from './prisma.provider.js';
import { PrismaService } from './prisma.service.js';
import { SimulatedExchange } from './SimulatedExchange.js';
import { SimulationController } from './simulation.controller.js';
import { StatisticsController } from './statistics.controller.js';
import { StatisticsCollector } from './StatisticsCollector.js';
import { StrategyDCA } from './StrategyDCA.js';
import { StrategyEnhancedDCA } from './StrategyEnhancedDCA.js';

@Module({
  controllers: [StatisticsController, SimulationController],
  exports: [],
  imports: [EventEmitterModule.forRoot({ global: true })],
  providers: [
    Accounts,
    Markets,
    Orders,
    SimulatedExchange,
    StatisticsCollector,
    StrategyDCA,
    StrategyEnhancedDCA,
    prismaProvider,
    PrismaService,
    CandlesImporter,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- NestJS module
export class AppModule {}
