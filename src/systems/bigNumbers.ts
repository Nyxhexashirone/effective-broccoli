import { BigNumber } from '../types/BigNumber';

export const ZERO: BigNumber = { mantissa: 0, exponent: 0 };

export function normalize(n: BigNumber): BigNumber {
  if (n.mantissa === 0) return ZERO;

  let mantissa = n.mantissa;
  let exponent = n.exponent;

  while (mantissa >= 10) {
    mantissa /= 10;
    exponent += 1;
  }

  while (mantissa < 1 && exponent > 0) {
    mantissa *= 10;
    exponent -= 1;
  }

  const remainder = exponent % 3;
  if (remainder !== 0) {
    mantissa *= Math.pow(10, remainder);
    exponent -= remainder;
  }

  return { mantissa, exponent };
}

export function add(a: BigNumber, b: BigNumber): BigNumber {
  if (a.mantissa === 0) return b;
  if (b.mantissa === 0) return a;

  const diff = a.exponent - b.exponent;

  if (Math.abs(diff) > 9) {
    return diff > 0 ? a : b;
  }

  const mantissa =
    diff >= 0
      ? a.mantissa + b.mantissa / Math.pow(10, diff)
      : a.mantissa / Math.pow(10, -diff) + b.mantissa;

  const exponent = diff >= 0 ? a.exponent : b.exponent;

  return normalize({ mantissa, exponent });
}

export function subtract(a: BigNumber, b: BigNumber): BigNumber {
  const negB: BigNumber = { mantissa: -b.mantissa, exponent: b.exponent };
  return normalize(add(a, negB));
}

export function multiply(a: BigNumber, b: BigNumber): BigNumber {
  return normalize({
    mantissa: a.mantissa * b.mantissa,
    exponent: a.exponent + b.exponent,
  });
}

export function compare(a: BigNumber, b: BigNumber): number {
  if (a.exponent !== b.exponent) {
    return a.exponent > b.exponent ? 1 : -1;
  }
  return a.mantissa > b.mantissa ? 1 : a.mantissa < b.mantissa ? -1 : 0;
}
