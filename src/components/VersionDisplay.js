import React from 'react';
import { Typography, Tag } from 'antd';

const { Text } = Typography;

const VersionDisplay = ({ className = '' }) => {
  const version = process.env.REACT_APP_VERSION || '1.0.0';
  const buildTime = process.env.REACT_APP_BUILD_TIME;
  
  const formatBuildTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Tag color="blue" size="small">
        v{version}
      </Tag>
      {buildTime && (
        <Text type="secondary" className="text-xs">
          Build: {formatBuildTime(buildTime)}
        </Text>
      )}
    </div>
  );
};

export default VersionDisplay;