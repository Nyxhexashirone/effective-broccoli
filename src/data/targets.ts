import { Target } from '../types/Target';

export const targets: Target[] = [
  {
    id: 'bubble',
    name: 'Bolha de Ar',
    subtitle: 'Extremamente frágil',
    image: '/assets/targets/bubble.png',
    tier: 0,
    maxHP: { mantissa: 1, exponent: 0 },
    defense: { mantissa: 0, exponent: 0 },
    drops: {
      bronze: { mantissa: 1, exponent: 0 },
    },
  },
];
