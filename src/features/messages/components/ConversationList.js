import React, { useState } from 'react';
import { List, Avatar, Input, Badge, Typography, Empty } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { MESSAGES_CONSTANTS } from '../constants';
import moment from 'moment';

const { Text } = Typography;

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  onConversationSelect,
  currentUserId,
  isMobile = false,
  onMobileBack
}) => {
  const [searchText, setSearchText] = useState('');

  const filteredConversations = conversations.filter(conv => {
    if (!searchText) return true;
    const otherUserName = conv.otherUserInfo?.displayName || 'Người dùng';
    return otherUserName.toLowerCase().includes(searchText.toLowerCase()) ||
           (conv.lastMessage || '').toLowerCase().includes(searchText.toLowerCase());
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return moment(time).fromNow();
  };

  const getOtherUserName = (conversation) => {
    return conversation.otherUserInfo?.displayName || 'Người dùng';
  };

  return (
    <div style={{ 
      width: isMobile ? '100%' : MESSAGES_CONSTANTS.SIDEBAR.WIDTH,
      borderRight: isMobile ? 'none' : `1px solid ${MESSAGES_CONSTANTS.COLORS.BORDER}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: 16, 
        borderBottom: `1px solid ${MESSAGES_CONSTANTS.COLORS.BORDER}` 
      }}>
        <Typography.Title level={4} style={{ margin: 0, marginBottom: 12 }}>
          {MESSAGES_CONSTANTS.MESSAGES.LABELS.MESSAGES_TITLE}
        </Typography.Title>
        <Input
          placeholder={MESSAGES_CONSTANTS.MESSAGES.LABELS.SEARCH_PLACEHOLDER}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Conversations List */}
      <div className="messages-scroll" style={{ flex: 1, overflow: 'auto' }}>
        {filteredConversations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={MESSAGES_CONSTANTS.MESSAGES.LABELS.NO_CONVERSATIONS}
            style={{ marginTop: 60 }}
          />
        ) : (
          <List
            dataSource={filteredConversations}
            renderItem={(conversation) => {
              const isActive = activeConversation === conversation.id;
              const otherUserName = getOtherUserName(conversation);
              const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

              return (
                <List.Item
                  onClick={() => onConversationSelect(conversation.id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#e6f7ff' : 'transparent',
                    borderLeft: isActive ? `3px solid ${MESSAGES_CONSTANTS.COLORS.PRIMARY}` : '3px solid transparent'
                  }}
                  className="conversation-item"
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={unreadCount > 0} color={MESSAGES_CONSTANTS.COLORS.UNREAD}>
                        <Avatar 
                          size={MESSAGES_CONSTANTS.CHAT.AVATAR_SIZE}
                          icon={<UserOutlined />}
                          src={conversation.otherUserInfo?.avatar}
                        >
                          {otherUserName.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong={unreadCount > 0}>{otherUserName}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatTime(conversation.lastMessageTime)}
                        </Text>
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text 
                          ellipsis 
                          style={{ 
                            maxWidth: 180,
                            fontWeight: unreadCount > 0 ? 500 : 'normal'
                          }}
                        >
                          {conversation.lastMessage || MESSAGES_CONSTANTS.MESSAGES.LABELS.NO_MESSAGES}
                        </Text>
                        {unreadCount > 0 && (
                          <Badge 
                            count={unreadCount} 
                            size="small"
                            style={{ backgroundColor: MESSAGES_CONSTANTS.COLORS.UNREAD }}
                          />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ConversationList;