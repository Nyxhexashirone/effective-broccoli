import { Upgrade } from '../types/Upgrade';

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
  {
    id: 'auto_damage',
    name: 'Auto Damage',
    description: 'Automatically deals damage.',
    maxLevel: 50,
    cost: {
      bronze: { mantissa: 15, exponent: 0 },
    },
  },
  {
    id: 'auto_speed',
    name: 'Auto Speed',
    description: 'Increases auto damage speed.',
    maxLevel: 25,
    cost: {
      bronze: { mantissa: 50, exponent: 0 },
    },
  },
];