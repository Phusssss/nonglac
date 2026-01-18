import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Avatar, Badge, Button, Dropdown, Typography, Space, Divider, Tooltip, Empty } from 'antd';
import { 
  SearchOutlined, 
  SendOutlined, 
  SmileOutlined, 
  PaperClipOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  PlusOutlined,
  CameraOutlined,
  FileImageOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../hooks/useAuth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useNavigate } from 'react-router-dom';
import EnhancedLoginModal from '../components/enhanced/EnhancedLoginModal';
import './MessagesPage.css';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

export default function MessagesPage() {
  const { user } = useAuth();
  const { requireAuth, showLoginModal, setShowLoginModal } = useAuthGuard();
  const { conversations, activeChat, messages, setActiveChat, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      // Lưu thông tin redirect
      localStorage.setItem('loginMessage', 'Đăng nhập để xem tin nhắn - sử dụng tính năng nhắn tin');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      // Redirect trực tiếp
      navigate('/phone-login');
    }
  }, [user, navigate]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const otherUserId = conv.participants?.find(p => p !== user?.uid);
    const otherUserName = conv.otherUserName || conv.participantNames?.[otherUserId] || '';
    return otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (conv.lastMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedConversation = conversations.find((conv) => conv.id === activeChat);

  const handleSendMessage = async () => {
    if (newMessage.trim() && activeChat) {
      await sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}p`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày`;
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const moreMenuItems = [
    {
      key: 'info',
      icon: <UserOutlined />,
      label: 'Xem trang cá nhân',
      onClick: () => {
        const otherUserId = selectedConversation?.participants?.find(p => p !== user?.uid);
        if (otherUserId) {
          navigate(`/user/${otherUserId}`);
        }
      }
    },
  ];

  const attachmentMenuItems = [
    {
      key: 'image',
      icon: <FileImageOutlined />,
      label: 'Hình ảnh',
    },
    {
      key: 'camera',
      icon: <CameraOutlined />,
      label: 'Chụp ảnh',
    },
  ];

  return (
    <div className="messages-page-container" style={{ 
      position: 'fixed',
      top: '64px',
      left: 0,
      right: 0,
      bottom: '64px',
      backgroundColor: 'white',
      zIndex: 1
    }}>
      <style>{`
        @media (max-width: 768px) {
          .messages-page-container {
            top: 64px !important;
            bottom: 64px !important;
            height: calc(100vh - 128px) !important;
          }
        }
        
        @media (min-width: 769px) {
          .messages-page-container {
            top: 64px !important;
            bottom: 0 !important;
            height: calc(100vh - 64px) !important;
          }
        }
      `}</style>
      <Layout style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
        {/* Sidebar - Conversations List */}
        <div 
          className={`conversations-sidebar ${activeChat ? 'mobile-hidden' : 'mobile-visible'}`}
          style={{ 
            height: '100%',
            width: '100%',
            maxWidth: '100%',
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <Text className="text-lg md:text-xl font-semibold text-gray-800">Tin nhắn</Text>
                <Button 
                  type="text" 
                  icon={<PlusOutlined />} 
                  className="text-blue-500 hover:bg-blue-50"
                  size="large"
                />
              </div>
              
              {/* Search */}
              <Input
                placeholder="Tìm kiếm tin nhắn"
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-full bg-gray-50 border-0"
                size="large"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              {filteredConversations.length === 0 ? (
                <div className="p-6 md:p-8 text-center">
                  <Empty 
                    description="Chưa có cuộc trò chuyện nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  <Text className="text-sm text-gray-500 mt-2 block">
                    Tìm người dùng và bắt đầu nhắn tin
                  </Text>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const otherUserId = conversation.participants?.find(p => p !== user?.uid);
                  const otherUserName = conversation.otherUserName || conversation.participantNames?.[otherUserId] || `User ${otherUserId?.slice(-4)}`;
                  const lastMessageTime = formatLastMessageTime(conversation.lastMessageTime);
                  const isActive = activeChat === conversation.id;
                  const unreadCount = conversation.unreadCount?.[user?.uid] || 0;
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setActiveChat(conversation.id)}
                      className={`p-3 md:p-4 cursor-pointer transition-all hover:bg-gray-50 active:bg-gray-100 ${
                        isActive ? 'bg-blue-50 border-r-3 border-r-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge dot={conversation.otherUserOnline} offset={[-8, 32]}>
                          <Avatar 
                            size={48} 
                            className="bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0"
                            icon={<UserOutlined />}
                          >
                            {otherUserName.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Text className={`font-medium truncate text-sm md:text-base ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                              {otherUserName}
                            </Text>
                            <Text className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {lastMessageTime}
                            </Text>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <Text className="text-xs md:text-sm text-gray-600 truncate pr-2">
                              {conversation.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                            </Text>
                            {unreadCount > 0 && (
                              <Badge 
                                count={unreadCount} 
                                size="small"
                                className="bg-blue-500 flex-shrink-0"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <Content 
          className={`flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}
          style={{
            height: '100%',
            width: '100%',
            flex: '1 1 auto',
            display: !activeChat ? 'none' : 'flex'
          }}
        >
          {selectedConversation ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-3 md:p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                    {/* Back button for mobile */}
                    <Button 
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => setActiveChat(null)}
                      className="md:hidden flex-shrink-0"
                      size="large"
                    />
                    
                    <Badge dot={selectedConversation.otherUserOnline} offset={[-8, 32]}>
                      <Avatar 
                        size={40} 
                        className="bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0"
                        icon={<UserOutlined />}
                      >
                        {(() => {
                          const otherUserId = selectedConversation.participants?.find(p => p !== user?.uid);
                          const otherUserName = selectedConversation.otherUserName || selectedConversation.participantNames?.[otherUserId] || 'User';
                          return otherUserName.charAt(0).toUpperCase();
                        })()}
                      </Avatar>
                    </Badge>
                    
                    <div className="flex-1 min-w-0">
                      <Text className="font-medium text-gray-900 block truncate text-sm md:text-base">
                        {(() => {
                          const otherUserId = selectedConversation.participants?.find(p => p !== user?.uid);
                          return selectedConversation.otherUserName || selectedConversation.participantNames?.[otherUserId] || 'User';
                        })()}
                      </Text>
                      <Text className="text-xs md:text-sm text-gray-500 truncate">
                        {selectedConversation.otherUserOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                      </Text>
                    </div>
                  </div>
                  
                  <Space className="flex-shrink-0">
                    <Tooltip title="Xem trang cá nhân">
                      <Button 
                        type="text" 
                        icon={<InfoCircleOutlined />} 
                        className="text-blue-500"
                        onClick={() => {
                          const otherUserId = selectedConversation?.participants?.find(p => p !== user?.uid);
                          if (otherUserId) {
                            navigate(`/user/${otherUserId}`);
                          }
                        }}
                      />
                    </Tooltip>
                    <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  </Space>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50" style={{ 
                WebkitOverflowScrolling: 'touch'
              }}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Empty 
                      description="Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {messages.map((message, index) => {
                      const isCurrentUser = message.senderId === user?.uid;
                      const messageTime = formatMessageTime(message.timestamp);
                      const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                        >
                          {!isCurrentUser && (
                            <Avatar 
                              size={28} 
                              className={`bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}
                              icon={<UserOutlined />}
                            >
                              {message.senderName?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[75%] md:max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                            {message.type === "image" ? (
                              <div className="rounded-2xl overflow-hidden shadow-sm">
                                <img
                                  src={message.message}
                                  alt="Hình ảnh được chia sẻ"
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`px-3 md:px-4 py-2 rounded-2xl shadow-sm ${
                                  isCurrentUser
                                    ? 'bg-blue-500 text-white rounded-br-md'
                                    : 'bg-white text-gray-800 rounded-bl-md'
                                }`}
                              >
                                <Text className={`text-sm md:text-base ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                                  {message.message}
                                </Text>
                              </div>
                            )}
                            
                            <div className={`mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                              <Text className="text-xs text-gray-500">
                                {messageTime}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-3 md:p-4 flex-shrink-0">
                <div className="flex items-end space-x-2 md:space-x-3">
                  <Dropdown menu={{ items: attachmentMenuItems }} placement="topLeft">
                    <Button 
                      type="text" 
                      icon={<PaperClipOutlined />} 
                      className="text-gray-500 hover:text-blue-500 flex-shrink-0"
                      size="large"
                    />
                  </Dropdown>
                  
                  <div className="flex-1">
                    <TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onPressEnter={handleKeyPress}
                      placeholder="Nhập tin nhắn..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      className="rounded-2xl resize-none border-gray-300"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !activeChat}
                    className="rounded-full bg-blue-500 border-blue-500 hover:bg-blue-600 flex-shrink-0"
                    size="large"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchOutlined className="text-3xl text-blue-500" />
                </div>
                <Text className="text-lg font-medium text-gray-900 block mb-2">
                  Chọn một cuộc trò chuyện
                </Text>
                <Text className="text-gray-500">
                  Chọn cuộc trò chuyện từ danh sách để bắt đầu nhắn tin
                </Text>
              </div>
            </div>
          )}
        </Content>
      </Layout>

      {/* Enhanced Login Modal */}
      <EnhancedLoginModal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        title="Đăng nhập để nhắn tin"
        message="Đăng nhập để sử dụng tính năng nhắn tin với cộng đồng"
        feature="gửi và nhận tin nhắn"
      />
    </div>
  );
}