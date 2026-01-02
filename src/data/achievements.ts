import { Achievement } from '../types/Achievement';

export const achievements: Achievement[] = [
  {
    id: 'first_click',
    name: 'Violence Begins',
    description: 'Click something for the first time.',
    condition: (state) => state.clicks >= 1,
    reward: {
      type: 'bonus',
      value: 'nothing',
    },
  },
  {
    id: 'first_destruction',
    name: 'It Is Gone',
    description: 'Destroy your first target.',
    condition: (state) => state.targetsDestroyed >= 1,
    reward: {
      type: 'unlock_system',
      value: 'upgrades',
    },
  },
  {
    id: 'ten_upgrades',
    name: 'Improvement Spiral',
    description: 'Purchase 10 upgrades.',
    hidden: true,
    condition: (state) => state.upgradesPurchased >= 10,
    reward: {
      type: 'unlock_system',
      value: 'auto_click',
    },
  },
];
