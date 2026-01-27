import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDocs,
  limit,
  getDoc
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { MESSAGES_CONSTANTS } from '../constants';
import { messagesUtils } from '../utils';

/**
 * Messages Service - Xử lý tất cả các thao tác liên quan đến tin nhắn
 * Bao gồm: tạo cuộc trò chuyện, gửi tin nhắn, lấy danh sách, đánh dấu đã đọc
 */
export const messagesService = {
  /**
   * Lấy thông tin người dùng từ Firestore
   * @param {string} userId - ID của người dùng
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async getUserInfo(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { success: true, user: userDoc.data() };
      }
      return { success: false, user: null };
    } catch (error) {
      console.error('Error getting user info:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Tạo cuộc trò chuyện mới giữa 2 người dùng
   * @param {string[]} participants - Mảng chứa ID của các người tham gia
   * @returns {Promise<{success: boolean, id?: string, error?: string}>}
   */
  async createConversation(participants) {
    try {
      const conversationRef = await addDoc(collection(db, 'conversations'), {
        participants,
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: serverTimestamp(),
        unreadCount: {}
      });
      return { success: true, id: conversationRef.id };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gửi tin nhắn và cập nhật unread count
   * @param {string} conversationId - ID cuộc trò chuyện
   * @param {string} senderId - ID người gửi
   * @param {string} content - Nội dung tin nhắn
   * @param {string} type - Loại tin nhắn (text, image, file)
   * @returns {Promise<{success: boolean, id?: string, error?: string}>}
   */
  async sendMessage(conversationId, senderId, content, type = MESSAGES_CONSTANTS.MESSAGE_TYPES.TEXT) {
    try {
      // Validate nội dung tin nhắn
      const validation = messagesUtils.validateMessage(content);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.content };
      }

      // Tạo tin nhắn mới
      const messageRef = await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId,
        content: content.trim(),
        type,
        timestamp: serverTimestamp(),
        status: MESSAGES_CONSTANTS.MESSAGE_STATUS.SENT
      });

      // Lấy thông tin conversation để biết participants
      const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
      const conversationData = conversationDoc.data();
      const otherUserId = conversationData.participants?.find(p => p !== senderId);

      // Cập nhật cuộc trò chuyện và tăng unread count cho người nhận
      const updateData = {
        lastMessage: messagesUtils.truncateText(content, 100),
        lastMessageTime: serverTimestamp()
      };
      
      if (otherUserId) {
        updateData[`unreadCount.${otherUserId}`] = (conversationData.unreadCount?.[otherUserId] || 0) + 1;
      }

      await updateDoc(doc(db, 'conversations', conversationId), updateData);

      return { success: true, id: messageRef.id };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Lắng nghe danh sách cuộc trò chuyện của user
   * @param {string} userId - ID người dùng
   * @param {Function} callback - Callback function khi có thay đổi
   * @returns {Function} Unsubscribe function
   */
  getConversations(userId, callback) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    return onSnapshot(q, callback, (error) => {
      console.error('Error listening to conversations:', error);
    });
  },

  /**
   * Lắng nghe tin nhắn trong cuộc trò chuyện
   * @param {string} conversationId - ID cuộc trò chuyện
   * @param {Function} callback - Callback function khi có thay đổi
   * @returns {Function} Unsubscribe function
   */
  getMessages(conversationId, callback) {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    
    return onSnapshot(q, callback, (error) => {
      console.error('Error listening to messages:', error);
    });
  },

  /**
   * Tìm cuộc trò chuyện giữa 2 người dùng
   * @param {string} userId1 - ID người dùng thứ nhất
   * @param {string} userId2 - ID người dùng thứ hai
   * @returns {Promise<{success: boolean, conversation?: object, error?: string}>}
   */
  async findConversation(userId1, userId2) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'in', [
          [userId1, userId2],
          [userId2, userId1]
        ])
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { success: true, conversation: snapshot.docs[0] };
      }
      return { success: false, conversation: null };
    } catch (error) {
      console.error('Error finding conversation:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Đánh dấu tin nhắn đã đọc và reset unread count
   * @param {string} conversationId - ID cuộc trò chuyện
   * @param {string} userId - ID người dùng
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async markAsRead(conversationId, userId) {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0,
        [`lastReadTime.${userId}`]: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking as read:', error);
      return { success: false, error: error.message };
    }
  }
};