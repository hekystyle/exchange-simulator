import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { BTCEUR_YEAR_DAILY_CANDLES } from './data.js';
import { SimulatedExchange } from './SimulatedExchange.js';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: /(localhost|127\.0\.0\.1):5173$/,
    },
  });
  app.enableShutdownHooks();
  await app.listen(3000);
  app.get(SimulatedExchange).simulate({
    pair: 'BTCEUR',
    candles: BTCEUR_YEAR_DAILY_CANDLES,
  });
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
