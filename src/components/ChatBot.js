import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../hooks/useAuth';
import mascotVideo from '../assets/images/supawork-ecb803acb3de479294cc2614fc1b6d11.webm';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// User Context for personalization
let userContext = {
  location: "Vietnam",
  crops: [],
  gardenInfo: "",
  hasConsent: false
};

// Chat history for conversation continuity
let chatHistory = [];

// Load saved context and history
try {
  const saved = localStorage.getItem('nonglac_user_context');
  if (saved) userContext = JSON.parse(saved);
  
  const savedHistory = localStorage.getItem('nonglac_chat_history');
  if (savedHistory) chatHistory = JSON.parse(savedHistory);
} catch (e) {}

const saveUserContext = () => {
  localStorage.setItem('nonglac_user_context', JSON.stringify(userContext));
};

const saveChatHistory = () => {
  localStorage.setItem('nonglac_chat_history', JSON.stringify(chatHistory));
};

const addToHistory = (role, content, image = null) => {
  const historyItem = {
    role,
    content,
    image,
    timestamp: new Date().toISOString()
  };
  chatHistory.push(historyItem);
  saveChatHistory();
};

const updateUserContextFromText = (text) => {
  const lower = text.toLowerCase();
  let updated = false;

  // Detect consent
  const consentKeywords = ['đồng ý', 'ok', 'được', 'ừ', 'yes', 'cho phép'];
  if (!userContext.hasConsent && consentKeywords.some(kw => lower.includes(kw))) {
    userContext.hasConsent = true;
    updated = true;
  }

  // Detect crops
  const cropKeywords = ['lúa', 'cà phê', 'sầu riêng', 'bơ', 'hoa hồng', 'dâu tây', 'rau', 'cúc', 'lan', 'tiêu', 'điều', 'chè', 'bắp', 'ngô', 'khoai', 'đậu'];
  cropKeywords.forEach(crop => {
    if (lower.includes(crop) && !userContext.crops.includes(crop)) {
      userContext.crops.push(crop);
      updated = true;
    }
  });

  if (updated) saveUserContext();
};

const getSystemInstruction = () => {
  return `Bạn là Lạc Lạc - AI chuyên gia nông nghiệp Việt Nam.

NGUYÊN TẮC TRẢ LỜI (TUYỆT ĐỐI):
- TRẢ LỜI NGẮN GỌN: Tối đa 2-3 câu, KHÔNG hỏi thêm câu hỏi dài dòng
- NẾU CÓ DỮ LIỆU THỰC TẾ: Sử dụng Google Search để lấy giá cả, tin tức, dữ liệu hiện tại
- KHÔNG LẠC ĐỀ: Chỉ trả lời câu hỏi, không hỏi lại
- LINH HOẠT: Có thể tư vấn về tất cả loại cây trồng (lúa, ngô, bắp, rau, hoa quả...), không chỉ riêng cây nào

THÔNG TIN NGƯỜI DÙNG:
- Đồng ý thu thập: ${userContext.hasConsent ? "RỒI" : "CHƯA"}
- Cây trồng quan tâm: ${userContext.crops.join(', ') || 'Chưa rõ'}
- Thông tin vườn: ${userContext.gardenInfo || 'Chưa rõ'}`;
};

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mascotVideoRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Load chat history if exists
      if (chatHistory.length > 0) {
        const restoredMessages = chatHistory.map((item, index) => ({
          id: index + 1,
          type: item.role === 'user' ? 'user' : 'bot',
          content: item.content,
          image: item.image,
          timestamp: new Date(item.timestamp)
        }));
        setMessages(restoredMessages);
      } else {
        // Show welcome message only for new conversations
        const userName = user?.displayName ? user.displayName.split(' ').pop() : 'bạn';
        const welcomeMsg = userContext.hasConsent 
          ? `Chào ${userName}! Lạc Lạc đây. Hôm nay vườn ${userContext.crops.join(', ') || 'nhà mình'} thế nào?`
          : `Chào ${userName}! Mình là Lạc Lạc. Để hỗ trợ tốt nhất, bạn cho phép mình lưu cuộc trò chuyện để học hỏi nhé?`;
        
        const welcomeMessage = {
          id: 1,
          type: 'bot',
          content: welcomeMsg,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
        addToHistory('assistant', welcomeMsg);
      }
    }
  }, [isOpen]);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !currentImage) return;



    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      image: currentImage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    addToHistory('user', inputText, currentImage);
    updateUserContextFromText(inputText);
    
    const sentText = inputText;
    const sentImage = currentImage;
    setInputText('');
    setCurrentImage(null);
    setIsLoading(true);

    try {
      const systemPrompt = getSystemInstruction();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        tools: [{ googleSearch: {} }]
      });
      
      let result;
      if (sentImage) {
        const imagePrompt = `Bạn là Lạc Lạc - chuyên gia nông nghiệp Việt Nam.

HÃY CHẨN ĐOÁN HÌNH ẢNH CÂY TRỒNG:
1. Xác định loại cây
2. Phân tích tình trạng sức khỏe (lá, thân, rễ, hoa, quả)
3. Phát hiện dấu hiệu bệnh hại, sâu bọ, thiếu chất dinh dưỡng
4. Đưa ra chẩn đoán và giải pháp xử lý cụ thể

TRẢ LỜI NGẮN GỌN, CỤ THỂ. Người dùng hỏi: ${sentText || "Chẩn đoán tình trạng cây này"}`;
        
        const imagePart = {
          inlineData: {
            data: sentImage.data,
            mimeType: sentImage.type
          }
        };
        result = await model.generateContent([imagePrompt, imagePart]);
      } else {
        result = await model.generateContent(`${systemPrompt}\n\n${sentText}`);
      }
      
      const response = await result.response;
      const fullText = response.text() || 'Xin lỗi, Lạc Lạc không thể trả lời lúc này.';
      
      // Create empty bot message first
      const botMessageId = Date.now() + 1;
      const botResponse = {
        id: botMessageId,
        type: 'bot',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      
      // Start typing animation
      setIsLoading(false);
      setIsTyping(true);
      if (mascotVideoRef.current) {
        mascotVideoRef.current.play();
      }
      
      // Stream text character by character
      let currentText = '';
      for (let i = 0; i < fullText.length; i++) {
        currentText += fullText[i];
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: currentText }
              : msg
          )
        );
        await new Promise(resolve => setTimeout(resolve, 30)); // 30ms delay per character
      }
      
      // Stop typing animation
      setIsTyping(false);
      if (mascotVideoRef.current) {
        mascotVideoRef.current.pause();
      }
      
      addToHistory('assistant', fullText);
    } catch (error) {
      setIsTyping(false);
      if (mascotVideoRef.current) {
        mascotVideoRef.current.pause();
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Xin lỗi, Lạc Lạc đang gặp sự cố kỹ thuật. Bạn thử lại sau nhé!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      addToHistory('assistant', 'Xin lỗi, Lạc Lạc đang gặp sự cố kỹ thuật. Bạn thử lại sau nhé!');
    }
    setIsLoading(false);
  };



  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setCurrentImage({
        data: base64,
        type: file.type,
        url: reader.result
      });
    };
    reader.readAsDataURL(file);
  };



  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: '24px', color: 'white' }}>🌱</span>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Mascot Video */}
      <video
        ref={mascotVideoRef}
        src={mascotVideo}
        loop
        muted
        style={{
          position: 'absolute',
          bottom: '90px',
          right: '15px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          objectFit: 'cover',
          zIndex: 1001,
          opacity: isTyping ? 1 : 0.7
        }}
      />
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #1CBECF 100%)',
        padding: '15px',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🌱</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Lạc Lạc AI</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Trợ lý nông nghiệp</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🗑️
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: message.type === 'user' ? '#E0F7FA' : '#f5f5f5',
              fontSize: '14px',
              lineHeight: '1.4'
            }}
          >
            {message.image && (
              <img 
                src={message.image.url} 
                alt="Uploaded" 
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }}
              />
            )}
            {message.content}
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '8px 12px',
            borderRadius: '12px',
            backgroundColor: '#f5f5f5',
            fontSize: '14px',
            fontStyle: 'italic',
            color: '#666'
          }}>
            Lạc Lạc đang suy nghĩ...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {currentImage && (
        <div style={{ padding: '10px 15px', borderTop: '1px solid #eee' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={currentImage.url} 
              alt="Preview" 
              style={{ maxWidth: '100px', borderRadius: '8px' }}
            />
            <button
              onClick={() => setCurrentImage(null)}
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} style={{
        padding: '15px',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          📷
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Hỏi Lạc Lạc hoặc gửi ảnh cây..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || (!inputText.trim() && !currentImage)}
          style={{
            background: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '...' : '➤'}
        </button>
      </form>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '280px'
          }}>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
              Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện không?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  chatHistory = [];
                  localStorage.removeItem('nonglac_chat_history');
                  setMessages([]);
                  setShowClearConfirm(false);
                  setIsOpen(false);
                  setTimeout(() => setIsOpen(true), 100);
                }}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Xóa
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  background: '#ccc',
                  color: 'black',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;