import React from 'react';
import { Trophy } from 'lucide-react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function AchievementsButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-1 border border-gray-400 text-sm ${
        disabled
          ? 'bg-gray-200 cursor-not-allowed'
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      <Trophy size={16} />
      Achievements
    </button>
  );
}
