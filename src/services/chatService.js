import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  where, 
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

class ChatService {
  constructor() {
    this.listeners = new Map();
  }

  async sendMessage(conversationId, senderId, senderName, message) {
    try {
      // Add message to messages subcollection
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        message: message,
        senderId,
        senderName,
        timestamp: serverTimestamp(),
        read: false
      });

      // Update conversation with last message info
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${senderId === conversationId.split('_')[0] ? conversationId.split('_')[1] : conversationId.split('_')[0]}`]: 1
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToMessages(conversationId, callback) {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      callback(messages);
    });

    this.listeners.set(conversationId, unsubscribe);
    return unsubscribe;
  }

  subscribeToConversations(userId, callback) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => {
        const data = doc.data();
        const otherUserId = data.participants?.find(p => p !== userId);
        
        return {
          id: doc.id,
          ...data,
          otherUserId,
          otherUserName: data.participantNames?.[otherUserId] || 'User',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date()
        };
      });
      
      // Sort by last message time
      conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      callback(conversations);
    });

    return unsubscribe;
  }

  async getOrCreateConversation(userId, otherUserId, otherUserName) {
    try {
      // Create conversation ID from sorted user IDs
      const conversationId = [userId, otherUserId].sort().join('_');
      
      // Check if conversation already exists
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        // Create new conversation
        await setDoc(conversationRef, {
          participants: [userId, otherUserId],
          participantNames: {
            [userId]: 'You', // This will be updated with actual name
            [otherUserId]: otherUserName
          },
          createdAt: serverTimestamp(),
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [userId]: 0,
            [otherUserId]: 0
          }
        });
      }
      
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async updateOnlineStatus(userId, isOnline) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isOnline: isOnline,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  async markMessagesAsRead(conversationId, userId) {
    try {
      // Reset unread count for this user
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  unsubscribeFromMessages(conversationId) {
    const unsubscribe = this.listeners.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(conversationId);
    }
  }
}

const chatService = new ChatService();
export default chatService;