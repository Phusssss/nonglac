import React from 'react';
import { Card, Row, Col, Progress, Typography } from 'antd';
import { MISSIONS_CONSTANTS } from '../constants';
import { missionsUtils } from '../utils';

const { Title, Text } = Typography;

const isImageIcon = (icon) => (
  typeof icon === 'string' &&
  (icon.endsWith('.svg') || icon.endsWith('.png') || icon.startsWith('http') || icon.startsWith('data:'))
);

/**
 * Component hiển thị thống kê của user (điểm, level, tiến độ)
 */
const UserStatsCard = ({
  score,
  currentLevel,
  dailyLoginStreak
}) => {
  const nextLevel = missionsUtils.getNextLevel(score);
  const pointsToNext = missionsUtils.getPointsToNextLevel(score);
  const progressToNext = nextLevel
    ? Math.min(100, ((score - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100)
    : 100;

  return (
    <Card
      className="mb-6 overflow-hidden"
      style={{
        background: MISSIONS_CONSTANTS.COLORS.GRADIENT_PRIMARY,
        border: 'none'
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8} className="text-center">
          <div>
            {isImageIcon(currentLevel.icon) ? (
              <img
                src={currentLevel.icon}
                alt={currentLevel.name || 'AgriTrust level'}
                style={{
                  width: window.innerWidth < 768 ? 64 : 88,
                  height: window.innerWidth < 768 ? 64 : 88,
                  objectFit: 'contain',
                  margin: '0 auto'
                }}
              />
            ) : (
              <span style={{ fontSize: window.innerWidth < 768 ? '36px' : '48px' }}>{currentLevel.icon}</span>
            )}
          </div>
          <Title
            level={window.innerWidth < 768 ? 5 : 4}
            style={{ color: 'white', margin: 0 }}
          >
            {currentLevel.level}
          </Title>
        </Col>

        <Col xs={24} sm={8} className="text-center">
          <Title
            level={window.innerWidth < 768 ? 3 : 2}
            style={{ color: 'white', margin: 0 }}
          >
            {missionsUtils.formatScore(score)}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
            {MISSIONS_CONSTANTS.MESSAGES.LABELS.REPUTATION_POINTS}
          </Text>
        </Col>

        <Col xs={24} sm={8} className="text-center">
          {nextLevel ? (
            <>
              <Title
                level={window.innerWidth < 768 ? 5 : 4}
                style={{ color: 'white', margin: 0 }}
              >
                Mục tiêu: {nextLevel.level}
              </Title>
              <Progress
                percent={progressToNext}
                showInfo={false}
                strokeColor="white"
              />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                Còn {missionsUtils.formatScore(pointsToNext)} điểm
              </Text>
            </>
          ) : (
            <>
              <Title
                level={window.innerWidth < 768 ? 5 : 4}
                style={{ color: 'white', margin: 0 }}
              >
                Cấp độ tối đa
              </Title>
              <Progress
                percent={100}
                showInfo={false}
                strokeColor="white"
              />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                Đã đạt cấp cao nhất
              </Text>
            </>
          )}
        </Col>
      </Row>

      {dailyLoginStreak > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
            <span style={{ fontSize: '16px' }}>🔥</span>
            <Text style={{ color: 'white', fontSize: '14px' }}>
              Đăng nhập liên tiếp: {dailyLoginStreak} ngày
            </Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserStatsCard;
