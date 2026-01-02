import { BigNumber } from '../types/BigNumber';
import { applyDamage } from './damage';

export interface TickResult {
  newHp: BigNumber;
  destroyed: boolean;
}

export function tickDamage(
  hp: BigNumber,
  autoDps: BigNumber,
  defense: BigNumber,
  deltaSeconds: number
): TickResult {
  if (autoDps.mantissa === 0) {
    return { newHp: hp, destroyed: false };
  }

  const damage: BigNumber = {
    mantissa: autoDps.mantissa * deltaSeconds,
    exponent: autoDps.exponent,
  };

  const newHp = applyDamage(hp, damage, defense);

  return {
    newHp,
    destroyed: newHp.mantissa === 0,
  };
}
