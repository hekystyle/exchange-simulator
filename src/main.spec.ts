import { Test } from '@nestjs/testing';
import { it, expect, beforeAll } from 'vitest';
import { AppModule } from './app.module.js';
import { BTCEUR_YEAR_DAILY_CANDLES } from './data.js';
import { SimulatedExchange } from './SimulatedExchange.js';
import type { INestApplication } from '@nestjs/common';

let app: INestApplication;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = module.createNestApplication();
  await app.init();
  return () => app.close();
});

it('should execute', async () => {
  const exchange = app.get(SimulatedExchange);

  exchange.simulate(BTCEUR_YEAR_DAILY_CANDLES);

  expect(exchange.accounts.toJSON()).toStrictEqual([
    {
      wallets: {
        BTC: {
          balance: 0.05361503,
          currency: 'BTC',
        },
        EUR: {
          balance: 0,
          currency: 'EUR',
        },
      },
      owner: 'DCA',
    },
    {
      wallets: {
        BTC: {
          balance: 0.05252607,
          currency: 'BTC',
        },
        EUR: {
          balance: 0,
          currency: 'EUR',
        },
      },
      owner: 'Enhanced DCA',
    },
  ]);
});
