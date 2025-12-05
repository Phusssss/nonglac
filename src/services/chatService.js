import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const chatService = {
  // Tạo hoặc lấy conversation
  async getOrCreateConversation(currentUserId, otherUserId, otherUserName) {
    const conversationId = [currentUserId, otherUserId].sort().join('_');
    const conversationRef = doc(db, 'conversations', conversationId);
    
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      // Lấy thông tin user hiện tại
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUserName = currentUserDoc.data()?.displayName || 'User';
      
      await setDoc(conversationRef, {
        participants: [currentUserId, otherUserId],
        participantNames: {
          [currentUserId]: currentUserName,
          [otherUserId]: otherUserName
        },
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: { [currentUserId]: 0, [otherUserId]: 0 }
      });
    } else {
      // Cập nhật tên nếu chưa có
      const data = conversationDoc.data();
      if (!data.participantNames || !data.participantNames[otherUserId]) {
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const currentUserName = currentUserDoc.data()?.displayName || 'User';
        
        await updateDoc(conversationRef, {
          participantNames: {
            ...data.participantNames,
            [currentUserId]: currentUserName,
            [otherUserId]: otherUserName
          }
        });
      }
    }
    
    return conversationId;
  },

  // Gửi tin nhắn
  async sendMessage(conversationId, senderId, senderName, message, type = 'text') {
    try {
      // Thêm tin nhắn
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId,
        senderName,
        message,
        type,
        timestamp: serverTimestamp(),
        read: false
      });

      // Cập nhật conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: message,
        lastMessageTime: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  },

  // Lắng nghe tin nhắn với pagination
  subscribeToMessages(conversationId, callback, limitCount = 50) {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse(); // Reverse để hiển thị từ cũ đến mới
      callback(messages);
    });
  },

  // Load tin nhắn cũ hơn
  async loadOlderMessages(conversationId, lastMessage, limitCount = 20) {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      startAfter(lastMessage.timestamp),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();
  },

  // Cập nhật trạng thái typing
  async updateTypingStatus(conversationId, userId, isTyping) {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`typing.${userId}`]: isTyping ? serverTimestamp() : null
    });
  },

  // Cập nhật trạng thái online
  async updateOnlineStatus(userId, isOnline) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          isOnline,
          lastSeen: serverTimestamp()
        });
      }
    } catch (error) {
      console.log('User document not found for online status update');
    }
  },

  // Lắng nghe danh sách conversation
  subscribeToConversations(userId, callback) {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef, 
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    return onSnapshot(q, async (snapshot) => {
      const conversations = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const otherUserId = data.participants.find(p => p !== userId);
        
        // Lấy tên người dùng từ collection users
        let otherUserName = data.participantNames?.[otherUserId];
        if (!otherUserName) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            otherUserName = userDoc.data()?.displayName || `User ${otherUserId?.slice(-4)}`;
          } catch (error) {
            otherUserName = `User ${otherUserId?.slice(-4)}`;
          }
        }
        
        conversations.push({
          id: docSnap.id,
          ...data,
          otherUserName
        });
      }
      
      callback(conversations);
    });
  },

  // Đánh dấu đã đọc
  async markAsRead(conversationId, userId) {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });
  }
};