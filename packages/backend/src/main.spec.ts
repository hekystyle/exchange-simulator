import { createReadStream } from 'fs';
import path from 'path';
import { Test } from '@nestjs/testing';
import { it, expect, beforeAll } from 'vitest';
import { Accounts } from './accounts/accounts.js';
import { AppModule } from './app.module.js';
import { CandlesImporter } from './candles/importer.service.js';
import { SimulatedExchange } from './simulated-exchange.js';
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
  const accounts = app.get(Accounts);

  await app.get(CandlesImporter).import({
    input: createReadStream(path.join(__dirname, '__fixtures__/BTC-EUR.csv'), 'utf8'),
    separator: ';',
    symbol: 'BTC-EUR',
    interval: 3600,
  });

  await exchange.configure({
    symbol: 'BTC-EUR',
    interval: 3600,
    range: undefined,
  });

  await exchange.start(undefined);

  expect(accounts.toJSON()).toStrictEqual([
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
