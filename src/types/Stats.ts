import { BigNumber } from './BigNumber';

export interface Stats {
  clickDamage: BigNumber;
  autoDamage: BigNumber;
  autoSpeed: number; // cliques por segundo
  critChance: number; // 0–1
  luck: number; // percentual (0.1 = +10%)
}
