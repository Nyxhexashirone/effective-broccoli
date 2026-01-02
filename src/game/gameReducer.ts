import { GameState } from './GameState';
import { targets } from '../data/targets';
import { calculateAutoDamage, calculateAutoSpeed, calculateAutoDPS } from '../systems/autoClick';
import { tickDamage } from '../systems/tick';
import { applyDrops } from '../systems/drops';

type Action =
  | { type: 'CLICK' }
  | { type: 'BUY_UPGRADE'; id: string }
  | { type: 'TICK'; delta: number };

import { BASE_AUTO_DAMAGE } from '../game/constants';

export function gameReducer(
  state: GameState,
  action: Action
): GameState {
  switch (action.type) {
    case 'TICK': {
      // Se o sistema não foi desbloqueado, não faz nada
      if (!state.unlocks.autoClick) return state;

      const target = targets[state.targetIndex];

      const autoDamageLevel = state.upgrades['auto_damage'] ?? 0;
      const autoSpeedLevel = state.upgrades['auto_speed'] ?? 0;

      if (autoDamageLevel === 0) return state;

      const autoDamage = calculateAutoDamage(
        BASE_AUTO_DAMAGE,
        autoDamageLevel
      );

      const autoSpeed = calculateAutoSpeed(autoSpeedLevel);

      const autoDps = calculateAutoDPS(autoDamage, autoSpeed);

      const result = tickDamage(
        state.hp,
        autoDps,
        target.defense,
        action.delta
      );

      // Target destruído automaticamente
      if (result.destroyed) {
        const newCurrencies = applyDrops(
          state.currencies,
          target.drops
        );

        const nextIndex =
          state.targetIndex < targets.length - 1
            ? state.targetIndex + 1
            : state.targetIndex;

        return {
          ...state,
          targetIndex: nextIndex,
          hp: targets[nextIndex].maxHP,
          currencies: newCurrencies,
        };
      }

      // Apenas dano contínuo
      return {
        ...state,
        hp: result.newHp,
      };
    }

    default:
      return state;
  }
}