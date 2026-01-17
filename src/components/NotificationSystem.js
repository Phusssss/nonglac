// Temporarily disabled MUI imports - will be migrated to Ant Design
// import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider, Button } from '@mui/material';
// import { Notifications, Circle } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { Badge, Button, Dropdown, Typography, Divider } from 'antd';
import { BellOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const NotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return unsubscribe;
  }, [user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await updateDoc(doc(db, 'notifications', notification.id), {
        read: true
      });
    }

    handleClose();
    
    if (notification.type === 'like' || notification.type === 'comment') {
      navigate(`/post/${notification.postId}`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.fromUserId}`);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    const promises = unreadNotifications.map(n => 
      updateDoc(doc(db, 'notifications', n.id), { read: true })
    );
    await Promise.all(promises);
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.fromUserName} đã thích bài viết của bạn`;
      case 'comment':
        return `${notification.fromUserName} đã bình luận bài viết của bạn`;
      case 'follow':
        return `${notification.fromUserName} đã theo dõi bạn`;
      case 'price_alert':
        return `Giá ${notification.productName} đã ${notification.alertType === 'above' ? 'vượt' : 'dưới'} ngưỡng`;
      default:
        return notification.message;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return `${Math.floor(diff / 86400000)} ngày trước`;
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 350, maxHeight: 400 }
        }}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Thông báo</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Đánh dấu đã đọc
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography color="text.secondary">Không có thông báo</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 1.5
              }}
            >
              <Box display="flex" alignItems="center" width="100%">
                {!notification.read && (
                  <Circle color="primary" sx={{ fontSize: 8, mr: 1 }} />
                )}
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {getNotificationText(notification)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatTime(notification.createdAt)}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationSystem;