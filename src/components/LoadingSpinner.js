import React from 'react';
import { Spin, Typography } from 'antd';

const { Text } = Typography;

const LoadingSpinner = ({ message = 'Đang tải...', size = 'default' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Spin size={size} />
      <Text type="secondary" className="mt-4">
        {message}
      </Text>
    </div>
  );
};

export default LoadingSpinner;