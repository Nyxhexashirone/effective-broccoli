import { Upgrade } from '../types/Upgrade';

export const upgrades: Upgrade[] = [
  {
    id: 'click_damage_1',
    name: 'Stronger Finger',
    description: 'Increase click damage by 1.',
    maxLevel: 10,
    cost: {
      bronze: { mantissa: 5, exponent: 0 },
    },
    effect: () => {},
  },
];
