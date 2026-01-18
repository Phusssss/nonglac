import React, { useState, useEffect } from 'react';
import { notification } from 'antd';
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';

const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      notification.success({
        message: 'Đã kết nối mạng',
        description: 'Ứng dụng đã khôi phục kết nối internet',
        icon: <WifiOutlined style={{ color: '#52c41a' }} />,
        duration: 3
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      notification.warning({
        message: 'Mất kết nối mạng',
        description: 'Ứng dụng đang hoạt động ở chế độ offline',
        icon: <DisconnectOutlined style={{ color: '#faad14' }} />,
        duration: 5
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything visible, just handle notifications
  return null;
};

export default PWAStatus;