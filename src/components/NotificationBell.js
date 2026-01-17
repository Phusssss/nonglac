import React, { useState, useEffect } from 'react';
import { Button, Badge, Dropdown, Typography, Divider, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import moment from 'moment';

const { Text } = Typography;

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    });

    return unsubscribe;
  }, [user]);

  const handleOpenChange = (flag) => {
    setOpen(flag);
  };

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '👍';
      case 'comment': return '💬';
      case 'follow': return '👤';
      default: return '🔔';
    }
  };

  const menuItems = notifications.length === 0 ? [
    {
      key: 'empty',
      label: (
        <div style={{ padding: '8px 0', textAlign: 'center' }}>
          <Text type="secondary">Không có thông báo nào</Text>
        </div>
      ),
      disabled: true
    }
  ] : [
    {
      key: 'header',
      label: (
        <div style={{ padding: '8px 0', fontWeight: 'bold' }}>
          Thông báo
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    ...notifications.slice(0, 10).map((notification) => ({
      key: notification.id,
      label: (
        <div 
          style={{ 
            padding: '8px 0',
            backgroundColor: notification.read ? 'transparent' : '#f0f0f0',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (!notification.read) {
              markAsRead(notification.id);
            }
            setOpen(false);
          }}
        >
          <Space align="start" style={{ width: '100%' }}>
            <span style={{ fontSize: '1.2em' }}>
              {getNotificationIcon(notification.type)}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: notification.read ? 'normal' : 'bold',
                marginBottom: '4px'
              }}>
                {notification.message}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {moment(notification.createdAt?.toDate()).fromNow()}
              </Text>
            </div>
            {!notification.read && (
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#1890ff', 
                borderRadius: '50%',
                marginTop: '4px'
              }} />
            )}
          </Space>
        </div>
      )
    }))
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayStyle={{ width: 320, maxHeight: 400, overflow: 'auto' }}
    >
      <Button 
        type="text" 
        icon={
          <Badge count={unreadCount} size="small">
            <BellOutlined style={{ fontSize: '18px' }} />
          </Badge>
        }
        style={{ border: 'none', boxShadow: 'none' }}
      />
    </Dropdown>
  );
};

export default NotificationBell;