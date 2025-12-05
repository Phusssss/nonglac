import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { chatService } from '../services/chatService';

export const useOnlineStatus = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set online khi component mount
    chatService.updateOnlineStatus(user.uid, true);

    // Set offline khi tab/window bị đóng
    const handleBeforeUnload = () => {
      chatService.updateOnlineStatus(user.uid, false);
    };

    // Set offline khi tab không active
    const handleVisibilityChange = () => {
      if (document.hidden) {
        chatService.updateOnlineStatus(user.uid, false);
      } else {
        chatService.updateOnlineStatus(user.uid, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat mỗi 30s để duy trì online status
    const heartbeat = setInterval(() => {
      if (!document.hidden) {
        chatService.updateOnlineStatus(user.uid, true);
      }
    }, 30000);

    return () => {
      chatService.updateOnlineStatus(user.uid, false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeat);
    };
  }, [user]);
};