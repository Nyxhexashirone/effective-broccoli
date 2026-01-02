import { Unlocks } from '../types/Unlocks';

export function createInitialUnlocks(): Unlocks {
  return {
    upgrades: false,
    autoClick: false,
    achievements: true,
  };
}

export function unlockSystem(unlocks: Unlocks, system: keyof Unlocks): Unlocks {
  return {
    ...unlocks,
    [system]: true,
  };
}
