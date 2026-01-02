import { Unlocks } from '../types/Unlocks';

const SAVE_KEY = 'destroyer_clicker_save_v1';

export interface SaveData {
  version: number;
  currencies: Record<string, any>; // Alterado de 'any' para 'Record<string, any>'
  upgrades: Record<string, number>;
  achievements: string[];
  unlocks: Unlocks;
  lastPlayed: number;
  discovery?: {
    currencies: string[];
  };
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

// Função de migração
function migrateSave(old: any): SaveData {
  // Por enquanto, reinicia — no futuro você migra campos
  console.warn('Save version mismatch, creating new save');
  return createNewSave();
}

export function saveGame(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadSave(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    const save = JSON.parse(raw) as SaveData;

    if (save.version !== 1) {
      return migrateSave(save);
    }

    return save;
  } catch {
    return null;
  }
}