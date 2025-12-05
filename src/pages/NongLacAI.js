import React, { useState, useEffect, useRef } from 'react';
// Temporary fallback to direct API call
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const NongLacAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'vi-VN';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev ? prev + ' ' + transcript : transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartApp = () => {
    setShowStartModal(false);
    // Add welcome message
    setMessages([{
      id: 1,
      type: 'bot',
      content: 'Chào bạn! Mình là Lạc Lạc đây. Để Lạc Lạc có thể đồng hành và hỗ trợ nhà mình tốt nhất, bạn cho phép mình lưu lại cuộc trò chuyện này để học hỏi thêm nhé? À, hiện tại vườn nhà mình đang trồng cây gì và quy mô khoảng bao nhiêu vậy ạ?',
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      image: selectedImage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    // Debug API key
    console.log('API Key exists:', !!process.env.REACT_APP_GEMINI_API_KEY);
    console.log('API Key preview:', process.env.REACT_APP_GEMINI_API_KEY?.substring(0, 10) + '...');
    
    // Call Gemini API directly
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('API key not found');
      }
      
      const prompt = `Bạn là LẠC LẠC - chuyên gia nông nghiệp từ Đà Lạt. Trả lời câu hỏi sau bằng giọng điệu nhẹ nhàng, thân thiện: ${inputText}`;
      
      console.log('Calling Gemini API directly...');
      
      // Try different model endpoints
      let response;
      const models = [
        'gemini-2.0-flash-001',
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash-lite'
      ];
      
      let lastError;
      for (const model of models) {
        try {
          console.log(`Trying model: ${model}`);
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          });
          
          if (response.ok) {
            console.log(`Success with model: ${model}`);
            break; // Found working model
          } else {
            console.log(`Failed with model ${model}: ${response.status}`);
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (err) {
          console.log(`Error with model ${model}:`, err.message);
          lastError = err;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('All models failed');
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi';
      
      console.log('Gemini response:', text);
      
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Force user to fix API issue
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: `❌ Lỗi kết nối Gemini API: ${error.message}\n\n🔧 Vui lòng:\n1. Enable Generative AI API tại Google Cloud Console\n2. Kiểm tra API key\n3. Đảm bảo có billing account`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    setIsLoading(false);
  };

  const generateSmartResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Greeting responses
    if (lowerInput.includes('xin chào') || lowerInput.includes('hi') || lowerInput.includes('hello')) {
      return 'Xin chào bạn! Lạc Lạc rất vui được gặp bạn. Bạn có thể hỏi Lạc Lạc về bất kỳ vấn đề nông nghiệp nào nhé!';
    }
    
    // Price related
    if (lowerInput.includes('giá') && (lowerInput.includes('phân bón') || lowerInput.includes('thuốc'))) {
      return 'Hiện tại giá phân bón đang dao động khoảng 15.000-25.000đ/kg tùy loại. Lạc Lạc khuyên bạn nên mua ở các đại lý uy tín và kiểm tra thành phần trước khi sử dụng nhé!';
    }
    
    // Pest control
    if (lowerInput.includes('sâu') || lowerInput.includes('bệnh')) {
      return 'Về vấn đề sâu bệnh, Lạc Lạc khuyên bạn nên áp dụng biện pháp phòng trừ tổng hợp (IPM). Hãy kiểm tra cây thường xuyên và sử dụng thuốc sinh học an toàn trước nhé!';
    }
    
    // Drawing/illustration
    if (lowerInput.includes('vẽ') || lowerInput.includes('hình minh họa')) {
      return 'Lạc Lạc rất muốn giúp bạn vẽ hình minh họa! Tuy nhiên hiện tại Lạc Lạc chưa thể vẽ được. Thay vào đó, Lạc Lạc có thể mô tả chi tiết hoặc gợi ý link tài liệu hữu ích cho bạn!';
    }
    
    // Default responses
    const defaultResponses = [
      'Lạc Lạc hiểu rồi! Đây là câu hỏi hay về nông nghiệp. Bạn có thể chia sẻ thêm chi tiết để Lạc Lạc tư vấn tốt hơn không?',
      'Cảm ơn bạn đã hỏi! Lạc Lạc sẽ cố gắng trả lời dựa trên kinh nghiệm từ Đà Lạt. Bạn có thể mô tả rõ hơn tình huống của mình không?',
      'Lạc Lạc rất quan tâm đến vấn đề này! Ở Đà Lạt, chúng mình thường gặp những tình huống tương tự. Bạn hãy kể thêm về điều kiện khí hậu và đất đai nhé!'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };
  
  const generateMockResponse = (input) => {
    const responses = [
      'Lạc Lạc hiểu rồi! Dựa vào mô tả của bạn, có vẻ như cây đang gặp vấn đề về dinh dưỡng. Bạn có thể cho Lạc Lạc biết thêm về tình trạng đất và chế độ tưới không?',
      'Đây là dấu hiệu của bệnh phổ biến trong mùa này. Lạc Lạc khuyên bạn nên kiểm tra độ ẩm đất và áp dụng biện pháp phòng trừ sinh học nhé.',
      'Cảm ơn bạn đã chia sẻ! Lạc Lạc sẽ ghi nhớ thông tin này để tư vấn tốt hơn. Bạn có muốn Lạc Lạc vẽ hình minh họa về cách chăm sóc không?'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const suggestedQuestions = [
    'Cách trị sâu cuốn lá lúa?',
    'Giá phân bón hôm nay?',
    'Vẽ hình minh họa sâu đục thân'
  ];

  if (showStartModal) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: '#4CAF50',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: 'white'
          }}>
            🌱
          </div>
          <h2 style={{ color: '#4CAF50', marginBottom: '10px' }}>
            Chào bà con! Tui là LẠC LẠC
          </h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Tui ở đây để giúp bà con trồng trọt, chẩn đoán bệnh cây và tám chuyện nhà nông.
          </p>
          <button
            onClick={handleStartApp}
            style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #1CBECF 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '50px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            🎥 Bắt đầu trò chuyện ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '768px',
      margin: '0 auto',
      background: '#F8F9FA',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #1CBECF 100%)',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🌱
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>LẠC LẠC</h1>
            <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>Trợ lý ảo của nhà nông</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}>
            🎓
          </button>
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}>
            🔊
          </button>
        </div>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              maxWidth: '85%',
              padding: '0.75rem 1rem',
              borderRadius: '1.25rem',
              alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
              background: message.type === 'user' ? '#E0F7FA' : '#FFFFFF',
              border: message.type === 'bot' ? '1px solid #E9ECEF' : 'none',
              borderBottomRightRadius: message.type === 'user' ? '0.25rem' : '1.25rem',
              borderBottomLeftRadius: message.type === 'bot' ? '0.25rem' : '1.25rem'
            }}
          >
            {message.image && (
              <img
                src={message.image}
                alt="Uploaded"
                style={{
                  maxWidth: '100%',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}
              />
            )}
            <div>{message.content}</div>
            {message.type === 'bot' && (
              <button
                style={{
                  background: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  // Text-to-speech functionality would go here
                  console.log('Speaking:', message.content);
                }}
              >
                🔊
              </button>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            background: '#FFFFFF',
            border: '1px solid #E9ECEF',
            padding: '0.75rem 1rem',
            borderRadius: '1.25rem',
            borderBottomLeftRadius: '0.25rem',
            fontStyle: 'italic',
            color: '#666'
          }}>
            Lạc Lạc đang suy nghĩ...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div style={{
        padding: '0.5rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        background: 'white',
        borderTop: '1px solid #E9ECEF'
      }}>
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => setInputText(question)}
            style={{
              background: 'white',
              border: '1px solid #1CBECF',
              color: '#4CAF50',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {question}
          </button>
        ))}
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div style={{ padding: '10px 1.5rem', background: 'white' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={selectedImage}
              alt="Preview"
              style={{ height: '80px', borderRadius: '10px', border: '2px solid #ddd' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <footer style={{
        padding: '1rem',
        background: '#ffffff',
        borderTop: '1px solid #E9ECEF'
      }}>
        <form onSubmit={handleSendMessage} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#f1f3f4',
          padding: '5px',
          borderRadius: '30px'
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
              width: '40px',
              height: '40px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '50%',
              fontSize: '20px'
            }}
          >
            📷
          </button>

          <button
            type="button"
            onClick={handleMicClick}
            style={{
              width: '40px',
              height: '40px',
              border: 'none',
              background: isRecording ? '#ffebee' : 'rgba(28, 190, 207, 0.1)',
              color: isRecording ? '#d32f2f' : '#4CAF50',
              cursor: 'pointer',
              borderRadius: '50%',
              fontSize: '20px'
            }}
          >
            🎤
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hỏi Lạc Lạc hoặc gửi ảnh cây bệnh..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '42px',
              height: '42px',
              border: 'none',
              background: isLoading ? '#ccc' : 'linear-gradient(135deg, #4CAF50 0%, #1CBECF 100%)',
              color: 'white',
              borderRadius: '50%',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '20px'
            }}
          >
            ➤
          </button>
        </form>
      </footer>
    </div>
  );
};

export default NongLacAI;