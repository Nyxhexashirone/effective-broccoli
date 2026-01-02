import { Upgrade } from '../types/Upgrade';

export const autoClickUpgrades: Upgrade[] = [
  {
    id: 'auto_damage',
    name: 'Auto Damage',
    description: 'Automatically deals damage every second.',
    maxLevel: 50,
    cost: {
      bronze: { mantissa: 15, exponent: 0 },
    },
  },
  {
    id: 'auto_speed',
    name: 'Auto Speed',
    description: 'Increases how often auto damage is applied.',
    maxLevel: 25,
    cost: {
      bronze: { mantissa: 50, exponent: 0 },
    },
  },
];