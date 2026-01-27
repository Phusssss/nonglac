import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Typography, Spin, Empty } from 'antd';
import { SendOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { MESSAGES_CONSTANTS } from '../constants';
import MessageBubble from './MessageBubble';
import moment from 'moment';

const { Text } = Typography;

const ChatWindow = ({ 
  messages, 
  loading, 
  sending,
  activeConversation,
  currentUserId,
  onSendMessage,
  conversationInfo,
  isMobile = false,
  onMobileBack
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || sending) return;
    
    onSendMessage(messageText);
    setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) {
    return (
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={MESSAGES_CONSTANTS.MESSAGES.LABELS.START_CONVERSATION}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Chat Header */}
      <div style={{
        height: MESSAGES_CONSTANTS.CHAT.HEADER_HEIGHT,
        padding: '0 16px',
        borderBottom: `1px solid ${MESSAGES_CONSTANTS.COLORS.BORDER}`,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white'
      }}>
        {isMobile && (
          <Button 
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onMobileBack}
            style={{ marginRight: 8 }}
          />
        )}
        <Avatar 
          icon={<UserOutlined />} 
          src={conversationInfo?.otherUserInfo?.avatar}
          style={{ marginRight: 12 }}
        >
          {conversationInfo?.otherUserInfo?.displayName?.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <Text strong>{conversationInfo?.otherUserInfo?.displayName || 'Người dùng'}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {MESSAGES_CONSTANTS.MESSAGES.LABELS.ONLINE}
            </Text>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-scroll" style={{ 
        flex: 1, 
        padding: 16, 
        overflowY: 'auto',
        backgroundColor: '#fafafa'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Text type="secondary">
              {MESSAGES_CONSTANTS.MESSAGES.LABELS.NO_MESSAGES}
            </Text>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showDate = index === 0 || 
                !moment(messages[index - 1].timestamp?.toDate()).isSame(
                  moment(message.timestamp?.toDate()), 'day'
                );

              return (
                <div key={message.id}>
                  {showDate && (
                    <div style={{ 
                      textAlign: 'center', 
                      margin: '16px 0',
                      color: '#999',
                      fontSize: 12
                    }}>
                      {moment(message.timestamp?.toDate()).format('DD/MM/YYYY')}
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={message.senderId === currentUserId}
                    isRead={conversationInfo?.lastReadTime?.[conversationInfo.otherUserId] > message.timestamp}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div style={{
        height: MESSAGES_CONSTANTS.CHAT.INPUT_HEIGHT,
        padding: 16,
        borderTop: `1px solid ${MESSAGES_CONSTANTS.COLORS.BORDER}`,
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input.TextArea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={MESSAGES_CONSTANTS.MESSAGES.LABELS.TYPE_MESSAGE}
            autoSize={{ minRows: 1, maxRows: 3 }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={sending}
            disabled={!messageText.trim()}
          >
            {MESSAGES_CONSTANTS.MESSAGES.BUTTONS.SEND}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;