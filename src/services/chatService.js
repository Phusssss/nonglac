import { db } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';

class ChatService {
  constructor() {
    this.listeners = new Map();
  }

  async sendMessage(chatId, senderId, senderName, message) {
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        message: message,
        senderId,
        senderName,
        timestamp: new Date(),
        read: false
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToMessages(chatId, callback) {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });

    this.listeners.set(chatId, unsubscribe);
    return unsubscribe;
  }

  subscribeToConversations(userId, callback) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(conversations);
    });

    return unsubscribe;
  }

  async getOrCreateConversation(userId, otherUserId, otherUserName) {
    // Simple implementation - just return a chat ID
    const chatId = [userId, otherUserId].sort().join('_');
    return chatId;
  }

  async updateOnlineStatus(userId, isOnline) {
    // Simple implementation - could update user status in Firestore
  }

  unsubscribeFromMessages(chatId) {
    const unsubscribe = this.listeners.get(chatId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(chatId);
    }
  }
}

const chatService = new ChatService();
export default chatService;