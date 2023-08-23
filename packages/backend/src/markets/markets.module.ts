import { Module } from '@nestjs/common';
import { Markets } from './markets.js';

@Module({
  providers: [Markets],
  exports: [Markets],
})
export class MarketsModule {}
