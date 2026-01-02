import { Achievement, AchievementState } from '../types/Achievement';

export interface AchievementProgress {
  unlocked: Set<string>;
}

export function checkAchievements(
  achievements: Achievement[],
  state: AchievementState,
  progress: AchievementProgress
): string[] {
  const newlyUnlocked: string[] = [];

  for (const achievement of achievements) {
    if (progress.unlocked.has(achievement.id)) continue;

    if (achievement.condition(state)) {
      progress.unlocked.add(achievement.id);
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}
