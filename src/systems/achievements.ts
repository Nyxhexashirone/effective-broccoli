import { Achievement, AchievementState } from '../types/Achievement';
import { Unlocks } from '../types/Unlocks';
import { applyAchievementReward } from './achievementRewards';

export interface AchievementProgress {
  unlocked: Set<string>;
}

export interface AchievementResult {
  unlockedIds: string[];
  unlocks: Unlocks;
}

export function checkAchievements(
  achievements: Achievement[],
  state: AchievementState,
  progress: AchievementProgress,
  unlocks: Unlocks
): AchievementResult {
  const unlockedIds: string[] = [];
  let newUnlocks = unlocks;

  for (const achievement of achievements) {
    if (progress.unlocked.has(achievement.id)) continue;

    if (achievement.condition(state)) {
      progress.unlocked.add(achievement.id);
      unlockedIds.push(achievement.id);

      newUnlocks = applyAchievementReward(
        achievement,
        newUnlocks
      );
    }
  }

  return {
    unlockedIds,
    unlocks: newUnlocks,
  };
}