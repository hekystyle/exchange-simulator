import { it, expect } from 'vitest';
import { runSimulation } from './main';

it('should execute', async () => {
  const { exchange } = await runSimulation();

  expect(exchange.accounts).toStrictEqual([
    {
      BTC: {
        balance: 0.05361503,
        currency: 'BTC',
      },
      EUR: {
        balance: 0,
        currency: 'EUR',
      },
      owner: 'StrategyDCA',
    },
  ]);
});
