import { Upgrade } from '../types/Upgrade';
import { BigNumber } from '../types/BigNumber';

export const upgrades: Upgrade[] = [
  {
    id: 'click_damage',
    name: 'Stronger Finger',
    description: 'Increase click damage by +1 per level.',
    maxLevel: 50,
    cost: {
      bronze: { mantissa: 5, exponent: 0 },
    },
  },
];
