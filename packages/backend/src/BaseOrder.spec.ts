import { expect, it } from 'vitest';
import { BaseOrder, OrderSide } from './BaseOrder.js';
import { Wallet } from './Wallet.js';

it.each([-1, 0])('should not allow sell negative or zero amount', amount => {
  expect(
    () =>
      new BaseOrder(
        {
          type: 'base',
          side: OrderSide.Buy,
          owner: 'owner',
          pair: { base: 'BTC', quote: 'EUR' },
          sellingAmount: amount,
        },
        new Wallet('EUR', 100),
        new Wallet('BTC', 0),
      ),
  ).toThrow('Selling amount must be positive');
});

it('should not allow to sell more than balance', () => {
  const sellingWallet = new Wallet('EUR', 100);
  expect(
    () =>
      new BaseOrder(
        {
          type: 'base',
          side: OrderSide.Buy,
          owner: 'owner',
          pair: { base: 'BTC', quote: 'EUR' },
          sellingAmount: 101,
        },
        sellingWallet,
        new Wallet('BTC', 0),
      ),
  ).toThrow('Insufficient balance funds');
  expect(sellingWallet.balance).toBe(100);
});
