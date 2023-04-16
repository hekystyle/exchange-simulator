import { expect, it } from 'vitest';
import { limitPrices } from './limitPrices.js';

it.each([[10000, [9700, 9400, 9100, 8800, 8500, 8200, 7900, 7600, 7300, 7000]]])(
  'should compute correct price',
  (price, expected) => {
    const actual = limitPrices(price, 10, 1);
    expect(actual).toEqual(expected);
  },
);
