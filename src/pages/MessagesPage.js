import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  MoreVertical,
  Paperclip,
  Smile,
} from "lucide-react";
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';


export default function MessagesPage() {
  const { user } = useAuth();
  const { conversations, activeChat, messages, setActiveChat, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef(null);

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
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays === 1) {
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };



  return (
    <div className="w-full px-0 py-0 pb-20 md:pb-0">
      <div
        className="bg-white overflow-hidden"
        style={{ height: "100vh" }}
      >
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-200 flex-col`}>
            {/* Search */}
            <div className="p-3 sm:p-6 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 pl-10 sm:pl-12 pr-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-gray-50 text-sm sm:text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <p className="text-sm sm:text-base">Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const otherUserId = conversation.participants?.find(p => p !== user?.uid);
                  const otherUserName = conversation.otherUserName || conversation.participantNames?.[otherUserId] || `User ${otherUserId?.slice(-4)}`;
                  const lastMessageTime = formatMessageTime(conversation.lastMessageTime);
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setActiveChat(conversation.id)}
                      className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        activeChat === conversation.id
                          ? "bg-[#4CAF50]/5 border-r-2 border-r-[#4CAF50]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4CAF50] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm sm:text-base">
                              {otherUserName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {conversation.otherUserOnline && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-[#795548] truncate text-sm sm:text-base">
                              {otherUserName}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {lastMessageTime}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                          </p>
                        </div>
                        {conversation.unreadCount?.[user?.uid] > 0 && (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-white font-medium">
                              {conversation.unreadCount[user.uid]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Back button for mobile */}
                    <button 
                      onClick={() => setActiveChat(null)}
                      className="md:hidden p-1 text-gray-400 hover:text-[#4CAF50] transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4CAF50] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm sm:text-base">
                          {(() => {
                            const otherUserId = selectedConversation.participants?.find(p => p !== user?.uid);
                            const otherUserName = selectedConversation.otherUserName || selectedConversation.participantNames?.[otherUserId] || 'User';
                            return otherUserName.charAt(0).toUpperCase();
                          })()}
                        </span>
                      </div>
                      {selectedConversation.otherUserOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#795548] text-sm sm:text-base truncate">
                        {(() => {
                          const otherUserId = selectedConversation.participants?.find(p => p !== user?.uid);
                          return selectedConversation.otherUserName || selectedConversation.participantNames?.[otherUserId] || 'User';
                        })()}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {selectedConversation.otherUserOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-3">

                    <button className="p-1.5 sm:p-2 text-gray-400 hover:text-[#4CAF50] transition-colors rounded-lg hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p className="text-sm sm:text-base">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.senderId === user?.uid;
                      const messageTime = formatMessageTime(message.timestamp);
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md ${isCurrentUser ? "order-2" : "order-1"}`}>
                            {message.type === "image" ? (
                              <div className="rounded-2xl overflow-hidden">
                                <img
                                  src={message.message}
                                  alt="Hình ảnh được chia sẻ"
                                  className="w-full h-32 sm:h-48 object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
                                  isCurrentUser
                                    ? "bg-[#4CAF50] text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <p className="text-sm leading-relaxed break-words">{message.message}</p>
                              </div>
                            )}
                            <p
                              className={`text-xs text-gray-500 mt-1 ${
                                isCurrentUser ? "text-right" : "text-left"
                              }`}
                            >
                              {messageTime}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 sm:p-6 border-t border-gray-200">
                  <div className="flex items-end space-x-2 sm:space-x-3">
                    <button className="p-2 text-gray-400 hover:text-[#4CAF50] transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0">
                      <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Gõ tin nhắn..."
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent text-sm sm:text-base"
                        rows="1"
                      />
                      <button className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#4CAF50] transition-colors">
                        <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !activeChat}
                      className="p-2 sm:p-3 bg-[#4CAF50] text-white rounded-2xl hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Chọn một cuộc trò chuyện
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Chọn cuộc trò chuyện từ danh sách để bắt đầu nhắn tin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}