import { BigNumber } from '../types/BigNumber';
import { multiply, add } from './bigNumbers';

export function calculateAutoDamage(
  base: BigNumber,
  level: number
): BigNumber {
  if (level === 0) return { mantissa: 0, exponent: 0 };
  return multiply(base, { mantissa: level, exponent: 0 });
}

export function calculateAutoSpeed(level: number): number {
  return 1 + level * 0.25;
}

export function calculateAutoDPS(
  damage: BigNumber,
  speed: number
): BigNumber {
  return multiply(damage, { mantissa: speed, exponent: 0 });
}
