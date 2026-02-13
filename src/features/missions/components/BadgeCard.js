import React from 'react';
import { Card, Badge, Typography } from 'antd';
import { MISSIONS_CONSTANTS } from '../constants';
import { missionsUtils } from '../utils';

const { Title, Text } = Typography;

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
    <Card 
      className="text-center h-full" 
      style={{ 
        opacity: isUnlocked ? 1 : (isSelectable ? 0.8 : 0.5), 
        background: isUnlocked ? '#f6ffed' : (isSelectable ? '#fffbe6' : '#f5f5f5'),
        borderColor: isUnlocked ? badgeColor : (isSelectable ? '#faad14' : undefined)
      }}
    >
      {/* Badge Icon */}
      <div style={{ 
        fontSize: window.innerWidth < 768 ? '36px' : '48px', 
        marginBottom: '12px',
        filter: isUnlocked ? 'none' : (isSelectable ? 'none' : 'grayscale(100%)')
      }}>
        {badge.icon}
      </div>
      
      {/* Badge Info */}
      <Title level={5} className="text-sm md:text-base mb-2">
        {badge.label}
      </Title>
      <Text type="secondary" className="text-xs md:text-sm">
        {badge.description}
      </Text>
      
      {/* Status */}
      <div className="mt-3">
        {isUnlocked ? (
          <Badge 
            status="success" 
            text="Đã đạt" 
            style={{ color: MISSIONS_CONSTANTS.COLORS.SUCCESS }}
          />
        ) : isSelectable ? (
          <Badge 
            status="warning" 
            text="Có thể chọn" 
            style={{ color: MISSIONS_CONSTANTS.COLORS.WARNING }}
          />
        ) : (
          <Badge 
            status="default" 
            text={`Cần ${missionsUtils.formatScore(pointsNeeded)} điểm nữa`}
            style={{ color: '#999' }}
          />
        )}
      </div>

      {/* Badge Type Indicator */}
      <div className="mt-2">
        <div 
          className="inline-block px-2 py-1 rounded text-xs font-medium"
          style={{ 
            backgroundColor: badgeColor + '20',
            color: badgeColor,
            border: `1px solid ${badgeColor}40`
          }}
        >
          {badge.type.toUpperCase()}
        </div>
      </div>
    </Card>
  );
};

export default BadgeCard;