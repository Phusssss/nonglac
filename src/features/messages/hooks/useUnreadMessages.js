import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { messagesService } from '../services';

/**
 * Custom hook quản lý số tin nhắn chưa đọc
 * Tự động cập nhật khi có tin nhắn mới hoặc đã đọc
 */
export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setTotalUnreadCount(0);
      return;
    }

    // Lắng nghe thay đổi conversations để cập nhật unread count
    const unsubscribe = messagesService.getConversations(
      user.uid,
      (snapshot) => {
        let total = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const unreadCount = data.unreadCount?.[user.uid] || 0;
          total += unreadCount;
        });
        setTotalUnreadCount(total);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return {
    totalUnreadCount
  };
};