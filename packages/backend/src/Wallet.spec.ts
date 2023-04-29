import { describe, expect, it } from 'vitest';
import { Wallet } from './Wallet.js';

describe('withdraw', () => {
  it.each([[-1, 0]])('should  not allow to withdraw negative or zero amount', amount => {
    const wallet = new Wallet('BTC');
    expect(() => wallet.withdraw(amount)).toThrow('Amount must be positive');
  });

  it('should not allow to withdraw more than balance', () => {
    const wallet = new Wallet('BTC', 100);
    expect(() => wallet.withdraw(101)).toThrow('Insufficient balance funds');
    expect(wallet.balance).toBe(100);
  });

  it('should allow to withdraw amount equal to balance', () => {
    const wallet = new Wallet('BTC', 100);
    wallet.withdraw(100);
    expect(wallet.balance).toBe(0);
  });
});

describe('deposit', () => {
  it.each([-1, 0])('should not allow deposit negative or zero amount', amount => {
    const wallet = new Wallet('BTC');
    expect(() => wallet.deposit(amount)).toThrow('Amount must be positive');
  });

  it('should allow to deposit positive amount', () => {
    const wallet = new Wallet('BTC');
    wallet.deposit(100);
    expect(wallet.balance).toBe(100);
  });
});
