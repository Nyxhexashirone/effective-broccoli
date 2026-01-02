import { BigNumber } from '../types/BigNumber';
import { multiply } from './bigNumbers';

export function calculateAutoDPS(
  autoDamage: BigNumber,
  autoSpeed: number
): BigNumber {
  if (autoSpeed <= 0) {
    return { mantissa: 0, exponent: 0 };
  }

  return multiply(autoDamage, {
    mantissa: autoSpeed,
    exponent: 0,
  });
}
