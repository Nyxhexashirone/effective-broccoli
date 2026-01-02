import { BigNumber } from '../types/BigNumber';
import { subtract, compare } from './bigNumbers';

export function applyDamage(
  hp: BigNumber,
  damage: BigNumber,
  defense: BigNumber
): BigNumber {
  const effective =
    compare(damage, defense) > 0
      ? subtract(damage, defense)
      : { mantissa: 0, exponent: 0 };

  const result = subtract(hp, effective);

  return compare(result, { mantissa: 0, exponent: 0 }) < 0
    ? { mantissa: 0, exponent: 0 }
    : result;
}
