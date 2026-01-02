import { BigNumber } from '../types/BigNumber';

const SUFFIXES: Record<number, string> = {
  0: '',
  3: 'K',
  6: 'M',
  9: 'B',
  12: 'T',
  15: 'Qa',
  18: 'Qi',
  21: 'Sx',
  24: 'Sp',
  27: 'Oc',
  30: 'No',
  33: 'Dc',
};

export function formatBigNumber(n: BigNumber): string {
  if (n.mantissa === 0) return '0';

  const suffix = SUFFIXES[n.exponent];
  if (!suffix) {
    return `${n.mantissa.toFixed(2)}e${n.exponent}`;
  }

  return `${n.mantissa.toFixed(2)}${suffix}`;
}
