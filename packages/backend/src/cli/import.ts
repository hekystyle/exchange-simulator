import '../dayjs.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { CandlesImporter } from '../candles/importer.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {});
  app.enableShutdownHooks();

  await app.init();

  await app.get(CandlesImporter).import(process.stdin);
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
