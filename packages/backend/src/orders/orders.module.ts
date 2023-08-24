import { Module } from '@nestjs/common';
import { MarketsModule } from '../markets/markets.module.js';
import { Orders } from './orders.js';

@Module({
  providers: [Orders],
  exports: [Orders],
  imports: [MarketsModule],
})
export class OrdersModule {}
