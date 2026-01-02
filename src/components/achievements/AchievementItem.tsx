import React from 'react';
import { Achievement } from '../../types/Achievement';

interface Props {
  achievement: Achievement;
  unlocked: boolean;
}

export function AchievementItem({ achievement, unlocked }: Props) {
  if (achievement.hidden && !unlocked) {
    return (
      <div className="border border-gray-300 p-2 text-sm text-gray-400 italic">
        ???
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-300 p-2 text-sm ${
        unlocked ? 'bg-white' : 'bg-gray-100 text-gray-500'
      }`}
    >
      <div className="font-medium">{achievement.name}</div>
      <div className="text-xs">{achievement.description}</div>
    </div>
  );
}
