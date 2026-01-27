import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { messagesService } from '../services';
import { messagesUtils } from '../utils';

/**
 * Custom hook quản lý messages và conversations
 * Cung cấp các function để gửi tin nhắn, tạo cuộc trò chuyện, đánh dấu đã đọc
 */
export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [userCache, setUserCache] = useState({}); // Cache thông tin user

  /**
   * Lấy thông tin user và cache lại
   */
  const getUserInfo = useCallback(async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }
    
    const result = await messagesService.getUserInfo(userId);
    if (result.success) {
      const userInfo = {
        displayName: messagesUtils.getDisplayName(result.user),
        email: result.user.email,
        avatar: result.user.photoURL
      };
      setUserCache(prev => ({ ...prev, [userId]: userInfo }));
      return userInfo;
    }
    return { displayName: 'Người dùng', email: '', avatar: null };
  }, [userCache]);

  // Lấy danh sách cuộc trò chuyện và thông tin user
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = messagesService.getConversations(
      user.uid,
      async (snapshot) => {
        const conversationsList = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const otherUserId = data.participants?.find(p => p !== user.uid);
            const otherUserInfo = otherUserId ? await getUserInfo(otherUserId) : null;
            
            return {
              id: doc.id,
              ...data,
              otherUserId,
              otherUserInfo
            };
          })
        );
        setConversations(conversationsList);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, getUserInfo]);

  // Lấy tin nhắn của cuộc trò chuyện đang active
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const unsubscribe = messagesService.getMessages(
      activeConversation,
      (snapshot) => {
        const messagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messagesList);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeConversation]);

  /**
   * Gửi tin nhắn
   */
  const sendMessage = useCallback(async (content, type = 'text') => {
    if (!activeConversation || !user?.uid || !content.trim()) {
      return { success: false, error: 'Thiếu thông tin cần thiết' };
    }

    setSending(true);
    try {
      const result = await messagesService.sendMessage(
        activeConversation,
        user.uid,
        content.trim(),
        type
      );
      return result;
    } finally {
      setSending(false);
    }
  }, [activeConversation, user?.uid]);

  /**
   * Tạo cuộc trò chuyện mới
   */
  const createConversation = useCallback(async (otherUserId) => {
    if (!user?.uid) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
    const existing = await messagesService.findConversation(user.uid, otherUserId);
    if (existing.success && existing.conversation) {
      setActiveConversation(existing.conversation.id);
      return { success: true, id: existing.conversation.id };
    }

    // Tạo cuộc trò chuyện mới
    const result = await messagesService.createConversation([user.uid, otherUserId]);
    if (result.success) {
      setActiveConversation(result.id);
    }
    return result;
  }, [user?.uid]);

  /**
   * Đánh dấu đã đọc
   */
  const markAsRead = useCallback(async (conversationId) => {
    if (!user?.uid) return { success: false, error: 'Chưa đăng nhập' };
    return await messagesService.markAsRead(conversationId, user.uid);
  }, [user?.uid]);

  return {
    // State
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    userCache,
    
    // Actions
    setActiveConversation,
    sendMessage,
    createConversation,
    markAsRead,
    getUserInfo
  };
};

// Export useUnreadMessages hook
export { useUnreadMessages } from './useUnreadMessages';