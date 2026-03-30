import React from 'react';
import { Card, Badge, Typography } from 'antd';
import { MISSIONS_CONSTANTS } from '../constants';
import { missionsUtils } from '../utils';

const { Title, Text } = Typography;

const isImageIcon = (icon) => (
  typeof icon === 'string' &&
  (icon.endsWith('.svg') || icon.endsWith('.png') || icon.startsWith('http') || icon.startsWith('data:'))
);

/**
 * Component hiển thị thông tin một badge/danh hiệu
 */
const BadgeCard = ({
  badgeId,
  isUnlocked,
  currentScore,
  canSelect = false
}) => {
  const badge = missionsUtils.getBadgeInfo(badgeId);

  if (!badge) return null;

  const badgeColor = missionsUtils.getBadgeColor(badge.type);
  const pointsNeeded = Math.max(0, badge.minScore - currentScore);
  const isSelectable = badge.requiresSelection && currentScore >= badge.minScore && !isUnlocked;

  return (
    <div
      className={`relative h-full rounded-2xl p-5 flex flex-col items-center justify-between text-center transition-all duration-300 ${
        isUnlocked
          ? 'bg-gradient-to-br from-green-50/50 to-white border border-[#4CAF50]/30 shadow-[0_2px_12px_-4px_rgba(76,175,80,0.15)] ring-1 ring-[#4CAF50]/10'
          : isSelectable
          ? 'bg-gradient-to-br from-amber-50/50 to-white border border-amber-300/50 shadow-sm'
          : 'bg-white border border-slate-100 shadow-sm opacity-60 grayscale-[40%]'
      }`}
    >
      <div
        className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
          isUnlocked
            ? 'bg-green-100/50 shadow-sm'
            : isSelectable
            ? 'bg-amber-100/50 shadow-sm'
            : 'bg-slate-50'
        }`}
      >
        <div className={`text-[48px] ${!isUnlocked && !isSelectable ? 'grayscale opacity-60' : ''}`}>
          {isImageIcon(badge.icon) ? (
            <img
              src={badge.icon}
              alt={badge.label}
              className="w-16 h-16 object-contain drop-shadow-sm"
            />
          ) : (
            badge.icon
          )}
        </div>
      </div>

      <div className="flex-1 w-full">
        <h4 className="font-bold text-slate-800 text-base mb-1">
          {badge.label}
        </h4>
        <p className="text-slate-500 text-[13px] leading-tight mb-4 min-h-[40px]">
          {badge.description}
        </p>
      </div>

      <div className="w-full space-y-3">
        {isUnlocked ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4CAF50]/10 text-[#388E3C] rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></span> Đã đạt
          </div>
        ) : isSelectable ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Có thể chọn
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-medium border border-slate-100">
            Nỗ lực thêm {missionsUtils.formatScore(pointsNeeded)} điểm
          </div>
        )}

        <div>
          <span
            className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border"
            style={{
              backgroundColor: `${badgeColor}15`,
              color: badgeColor,
              borderColor: `${badgeColor}30`
            }}
          >
            {badge.type}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;
