import React from 'react';
import { Progress } from 'antd';

const TrustGauge = ({ score = 0, nextLevel = 500 }) => {
  const percent = Math.min(100, (score / nextLevel) * 100);
  
  const getColor = () => {
    if (score >= 3000) return '#722ed1';
    if (score >= 1500) return '#faad14';
    if (score >= 500) return '#52c41a';
    return '#1890ff';
  };

  const getLevel = () => {
    if (score >= 3000) return '👑';
    if (score >= 1500) return '🏆';
    if (score >= 500) return '🚜';
    return '🌱';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>
        {getLevel()}
      </div>
      <Progress
        type="circle"
        percent={percent}
        size={60}
        strokeColor={getColor()}
        format={() => score}
      />
    </div>
  );
};

export default TrustGauge;