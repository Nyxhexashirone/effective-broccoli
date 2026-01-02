import React from 'react';
import { achievements } from '../../data/achievements';
import { AchievementItem } from './AchievementItem';

interface Props {
  unlockedAchievements: Set<string>;
  onClose: () => void;
}

export function AchievementsPanel({ unlockedAchievements, onClose }: Props) {
  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-[420px] max-h-[70vh] bg-[#f6f6f6] border border-gray-400 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm uppercase text-gray-600">Achievements</h2>
          <button
            onClick={onClose}
            className="text-xs border border-gray-400 px-2 hover:bg-gray-200"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {achievements.map((achievement) => (
            <AchievementItem
              key={achievement.id}
              achievement={achievement}
              unlocked={unlockedAchievements.has(achievement.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
