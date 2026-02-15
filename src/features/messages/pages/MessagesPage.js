import React, { useState, useEffect, useRef } from 'react';
import { Layout, notification } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { useMessages } from '../hooks';
import { MESSAGES_CONSTANTS } from '../constants';
import { ConversationList, ChatWindow } from '../components';
import EnhancedLoginModal from '../../../components/enhanced/EnhancedLoginModal';
import '../components/messages.css';

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { requireAuth, showLoginModal, setShowLoginModal } = useAuthGuard();
  const {
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    setActiveConversation,
    sendMessage,
    sendMessageToConversation,
    createConversation,
    markAsRead
  } = useMessages();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showChat, setShowChat] = useState(false);
  const initializedFromQueryRef = useRef(new Set());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetUserId = params.get('userId');
    const initMessage = params.get('initMessage');

    if (!targetUserId || !user?.uid || targetUserId === user.uid) {
      return;
    }

    const initKey = `${targetUserId}:${initMessage || ''}`;
    if (initializedFromQueryRef.current.has(initKey)) {
      return;
    }
    initializedFromQueryRef.current.add(initKey);

    let cancelled = false;
    requireAuth(async () => {
      const conversationResult = await createConversation(targetUserId);
      if (!conversationResult.success || cancelled) {
        notification.error({
          message: 'Loi',
          description: 'Khong the tao cuoc tro chuyen moi'
        });
        return;
      }

      if (isMobile) {
        setShowChat(true);
      }

      await markAsRead(conversationResult.id);

      if (initMessage && initMessage.trim()) {
        const sendResult = await sendMessageToConversation(conversationResult.id, initMessage.trim());
        if (!sendResult.success) {
          notification.error({
            message: 'Loi',
            description: MESSAGES_CONSTANTS.MESSAGES.ERROR.SEND_FAILED
          });
        }
      }

      navigate('/messages', { replace: true });
    });

    return () => {
      cancelled = true;
    };
  }, [
    location.search,
    user?.uid,
    isMobile,
    requireAuth,
    createConversation,
    markAsRead,
    sendMessageToConversation,
    navigate
  ]);

  const activeConversationInfo = conversations.find(conv => conv.id === activeConversation);

  const handleConversationSelect = async (conversationId) => {
    return requireAuth(async () => {
      setActiveConversation(conversationId);
      if (isMobile) {
        setShowChat(true);
      }
      await markAsRead(conversationId);
    });
  };

  const handleMobileBack = () => {
    setShowChat(false);
    setActiveConversation(null);
  };

  const handleSendMessage = async (content) => {
    return requireAuth(async () => {
      const result = await sendMessage(content);
      if (!result.success) {
        notification.error({
          message: 'Lỗi',
          description: MESSAGES_CONSTANTS.MESSAGES.ERROR.SEND_FAILED
        });
      }
    });
  };

  return (
    <Layout className="messages-page-container">
      <div style={{ 
        display: 'flex', 
        height: '100%',
        backgroundColor: 'white'
      }}>
        {/* Mobile: Hiện thị list hoặc chat */}
        {isMobile ? (
          <>
            {!showChat ? (
              <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                onConversationSelect={handleConversationSelect}
                currentUserId={user?.uid}
                isMobile={true}
              />
            ) : (
              <ChatWindow
                messages={messages}
                loading={loading}
                sending={sending}
                activeConversation={activeConversation}
                currentUserId={user?.uid}
                onSendMessage={handleSendMessage}
                conversationInfo={activeConversationInfo}
                isMobile={true}
                onMobileBack={handleMobileBack}
              />
            )}
          </>
        ) : (
          /* Desktop: Hiện thị cả hai */
          <>
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onConversationSelect={handleConversationSelect}
              currentUserId={user?.uid}
              isMobile={false}
            />
            
            <ChatWindow
              messages={messages}
              loading={loading}
              sending={sending}
              activeConversation={activeConversation}
              currentUserId={user?.uid}
              onSendMessage={handleSendMessage}
              conversationInfo={activeConversationInfo}
              isMobile={false}
            />
          </>
        )}
      </div>

      <EnhancedLoginModal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        title="Đăng nhập để sử dụng tin nhắn"
        message="Đăng nhập để gửi và nhận tin nhắn từ cộng đồng nông dân"
        feature="nhắn tin"
      />
    </Layout>
  );
};

export default MessagesPage;
