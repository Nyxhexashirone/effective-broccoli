import { SaveData } from './save';
import { GameState } from '../game/GameState';
import { targets } from '../data/targets';

export function saveToGameState(save: SaveData): GameState {
  return {
    targetIndex: 0,
    hp: targets[0].maxHP,
    currencies: save.currencies,
    upgrades: save.upgrades,
    unlocks: save.unlocks,
  };
}

export function gameStateToSave(state: GameState): SaveData {
  return {
    version: 1,
    currencies: state.currencies,
    upgrades: state.upgrades,
    achievements: [],
    unlocks: state.unlocks,
    lastPlayed: Date.now(),
  };
}