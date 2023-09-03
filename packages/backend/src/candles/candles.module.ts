import { Module } from '@nestjs/common';
import { CandlesController } from './candles.controller.js';
import { CandlesImporter } from './importer.service.js';

@Module({
  providers: [CandlesImporter],
  controllers: [CandlesController],
})
export class CandlesModule {}
