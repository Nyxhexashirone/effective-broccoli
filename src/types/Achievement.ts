export interface Achievement {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
  condition: (state: AchievementState) => boolean;
  reward: AchievementReward;
}

export interface AchievementState {
  clicks: number;
  targetsDestroyed: number;
  upgradesPurchased: number;
}

export interface AchievementReward {
  type: 'unlock_system' | 'bonus';
  value: string;
}
