import { expect, it } from 'vitest';
import { arithmeticProgression } from './aritmeticProgression.js';

it.each([
  [{ S: 55, n: 10, a1: 1 }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
  [{ S: 5, n: 4, a1: 0.5 }, [0.5, 1, 1.5, 2]],
])('should create correct sequence %p', ({ S, n, a1 }, expected) => {
  const arithmeticSequence = arithmeticProgression(S, n, a1);
  expect(arithmeticSequence).toStrictEqual(expected);
});
