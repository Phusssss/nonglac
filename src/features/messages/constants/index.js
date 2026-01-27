export const MESSAGES_CONSTANTS = {
  // UI Constants
  COLORS: {
    PRIMARY: '#1890ff',
    ONLINE: '#52c41a',
    OFFLINE: '#d9d9d9',
    UNREAD: '#ff4d4f',
    SENT: '#1890ff',
    RECEIVED: '#f0f0f0',
    BORDER: '#f0f0f0'
  },
  
  // Layout Constants
  SIDEBAR: {
    WIDTH: 300,
    MIN_WIDTH: 250
  },
  
  CHAT: {
    HEADER_HEIGHT: 60,
    INPUT_HEIGHT: 80,
    MESSAGE_PADDING: 12,
    AVATAR_SIZE: 40
  },
  
  // Text Constants
  MESSAGES: {
    LABELS: {
      MESSAGES_TITLE: 'Tin nhắn',
      SEARCH_PLACEHOLDER: 'Tìm kiếm cuộc trò chuyện...',
      TYPE_MESSAGE: 'Nhập tin nhắn...',
      ONLINE: 'Đang hoạt động',
      OFFLINE: 'Không hoạt động',
      TYPING: 'đang nhập...',
      NO_MESSAGES: 'Chưa có tin nhắn nào',
      NO_CONVERSATIONS: 'Chưa có cuộc trò chuyện nào',
      START_CONVERSATION: 'Bắt đầu cuộc trò chuyện mới'
    },
    BUTTONS: {
      SEND: 'Gửi',
      NEW_CHAT: 'Trò chuyện mới',
      ATTACH: 'Đính kèm',
      EMOJI: 'Biểu tượng cảm xúc'
    },
    SUCCESS: {
      MESSAGE_SENT: 'Tin nhắn đã được gửi',
      CONVERSATION_CREATED: 'Cuộc trò chuyện mới đã được tạo'
    },
    ERROR: {
      SEND_FAILED: 'Không thể gửi tin nhắn',
      LOAD_FAILED: 'Không thể tải tin nhắn',
      CONNECTION_FAILED: 'Mất kết nối'
    }
  },
  
  // Message Types
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
    SYSTEM: 'system'
  },
  
  // Message Status
  MESSAGE_STATUS: {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed'
  },
  
  // User Status
  USER_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away'
  }
};