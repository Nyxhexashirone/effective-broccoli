import { Unlocks } from '../types/Unlocks';
import { unlockSystem } from './unlocks';
import { Achievement } from '../types/Achievement';

export function applyAchievementReward(
  achievement: Achievement,
  unlocks: Unlocks
): Unlocks {
  if (achievement.reward.type === 'unlock_system') {
    return unlockSystem(
      unlocks,
      achievement.reward.value as keyof Unlocks
    );
  }

  return unlocks;
}