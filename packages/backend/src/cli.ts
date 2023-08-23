import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { CandlesImporter } from './candles.importer.js';

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {});
  app.enableShutdownHooks();
  await app.init();

  const importer = app.get(CandlesImporter);
  const readable = fs.createReadStream(path.join(__dirname, '../src/data/BTC-EUR.csv'));
  await importer.importFile(readable);

  await app.close();
}

bootstrap().catch(console.error);
