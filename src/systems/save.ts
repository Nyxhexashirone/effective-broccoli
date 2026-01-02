import { Save } from '../types/Save';

const SAVE_KEY = 'destroyer_clicker_save';
const SAVE_VERSION = 1;

export function loadSave(): Save | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Save;
  } catch {
    return null;
  }
}

export function createNewSave(): Save {
  return {
    version: SAVE_VERSION,
    currencies: {
      bronze: { mantissa: 0, exponent: 0 },
    },
    upgrades: {},
    discovery: {
      currencies: ['bronze'],
    },
  };
}

export function saveGame(save: Save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
