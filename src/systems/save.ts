import { Unlocks } from '../types/Unlocks';

const SAVE_KEY = 'destroyer_clicker_save_v1';

export interface SaveData {
  version: number;
  currencies: any;
  upgrades: Record<string, number>;
  achievements: string[];
  unlocks: Unlocks;
  lastPlayed: number;
}

export function createNewSave(): SaveData {
  return {
    version: 1,
    currencies: {
      bronze: { mantissa: 0, exponent: 0 },
    },
    upgrades: {},
    achievements: [],
    unlocks: {
      upgrades: false,
      autoClick: false,
      achievements: true,
    },
    lastPlayed: Date.now(),
  };
}

export function saveGame(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadSave(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
