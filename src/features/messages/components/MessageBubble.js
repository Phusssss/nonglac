import React from 'react';
import { Typography, Avatar } from 'antd';
import { UserOutlined, CheckOutlined } from '@ant-design/icons';
import { MESSAGES_CONSTANTS } from '../constants';
import moment from 'moment';

const { Text } = Typography;

const MessageBubble = ({ message, isOwn, isRead = false }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return moment(time).format('HH:mm');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      alignItems: 'flex-end'
    }}>
      {!isOwn && (
        <Avatar 
          size="small" 
          icon={<UserOutlined />} 
          style={{ marginRight: 8 }}
        />
      )}
      
      <div style={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start'
      }}
      className="message-bubble"
      >
        <div style={{
          padding: MESSAGES_CONSTANTS.CHAT.MESSAGE_PADDING,
          borderRadius: 18,
          backgroundColor: isOwn 
            ? MESSAGES_CONSTANTS.COLORS.SENT 
            : MESSAGES_CONSTANTS.COLORS.RECEIVED,
          color: isOwn ? 'white' : 'black',
          wordBreak: 'break-word',
          position: 'relative'
        }}>
          <Text style={{ color: isOwn ? 'white' : 'inherit' }}>
            {message.content}
          </Text>
        </div>
        
        <Text 
          type="secondary" 
          style={{ 
            fontSize: 11, 
            marginTop: 4,
            marginLeft: isOwn ? 0 : 8,
            marginRight: isOwn ? 8 : 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {formatTime(message.timestamp)}
          {isOwn && (
            <CheckOutlined 
              style={{ 
                color: isRead ? MESSAGES_CONSTANTS.COLORS.PRIMARY : '#d9d9d9',
                fontSize: 10
              }} 
            />
          )}
        </Text>
      </div>

      {isOwn && (
        <Avatar 
          size="small" 
          icon={<UserOutlined />} 
          style={{ marginLeft: 8 }}
        />
      )}
    </div>
  );
};

export default MessageBubble;