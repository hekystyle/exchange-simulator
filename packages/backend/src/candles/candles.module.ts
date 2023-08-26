import { Module } from '@nestjs/common';
import { CandlesImporter } from './importer.service.js';

@Module({
  providers: [CandlesImporter],
})
export class CandlesModule {}
