export function arithmeticProgression(S: number, n: number, a1: number): number[] {
  const d = (2 * S - n * a1) / (n * n);

  return Array.from({ length: n }, (_, i) => a1 + i * d);
}
