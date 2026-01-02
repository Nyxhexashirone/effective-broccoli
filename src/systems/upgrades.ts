import { BigNumber } from '../types/BigNumber';
import { add, multiply } from './bigNumbers';

export function getUpgradeCost(
  baseCost: BigNumber,
  level: number
): BigNumber {
  // custo = base * (1.5 ^ level)
  const multiplier = Math.pow(1.5, level);
  return multiply(baseCost, { mantissa: multiplier, exponent: 0 });
}

export function applyClickDamageUpgrade(
  baseDamage: BigNumber,
  level: number
): BigNumber {
  if (level === 0) return baseDamage;

  return add(baseDamage, {
    mantissa: level,
    exponent: 0,
  });
}
