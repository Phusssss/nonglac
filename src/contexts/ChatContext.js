import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  useOnlineStatus(); // Auto manage online status
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Lắng nghe conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = chatService.subscribeToConversations(user.uid, (conversations) => {
      setConversations(conversations);
    });

    return unsubscribe;
  }, [user]);

  // Lắng nghe messages của chat đang active
  useEffect(() => {
    if (!activeChat) return;

    const unsubscribe = chatService.subscribeToMessages(activeChat, (msgs) => {
      setMessages(msgs);
    });

    return unsubscribe;
  }, [activeChat]);

  const startChat = async (otherUserId, otherUserName) => {
    if (!user) return;
    
    const conversationId = await chatService.getOrCreateConversation(user.uid, otherUserId, otherUserName);
    setActiveChat(conversationId);
    setIsChatOpen(true);
  };

  const sendMessage = async (message) => {
    if (!user || !activeChat) return;
    
    return await chatService.sendMessage(
      activeChat,
      user.uid,
      user.displayName,
      message
    );
  };

  const value = {
    conversations,
    activeChat,
    messages,
    isChatOpen,
    setIsChatOpen,
    setActiveChat,
    startChat,
    sendMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};