import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import subscriptionService from '../services/subscriptionService';
import { chatWithAgriBot, analyzePlantImage } from '../services/geminiService';


const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

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

// Save to Firestore for AI learning
const saveToFirestore = async (userId, userName, role, content, image = null) => {
  try {
    await addDoc(collection(db, 'chatHistory'), {
      userId,
      userName,
      role,
      content,
      image: image ? { type: image.type } : null,
      timestamp: new Date(),
      userContext: {
        crops: userContext.crops,
        location: userContext.location
      }
    });
  } catch (error) {
    console.error('Error saving to Firestore:', error);
  }
};

// Load user's chat history from Firestore
const loadUserHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'chatHistory'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()).reverse();
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
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

  // Listen for open event from navbar
  useEffect(() => {
    const handleOpenChatBot = () => {
      setIsOpen(true);
    };
    
    window.addEventListener('openChatBot', handleOpenChatBot);
    return () => window.removeEventListener('openChatBot', handleOpenChatBot);
  }, []);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [quotaRemaining, setQuotaRemaining] = useState(null);
  
  // Voice/Video Call States
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('voice');
  const [callStatus, setCallStatus] = useState('idle');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mascotVideoRef = useRef(null);
  const lastRequestTime = useRef(0);
  
  // Live API refs
  const aiRef = useRef(null);
  const sessionRef = useRef(null);
  const inputCtxRef = useRef(null);
  const outputCtxRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
    if (isOpen && user) {
      updateQuota();
    }
  }, [isOpen, user]);

  const updateQuota = async () => {
    if (user) {
      const remaining = await subscriptionService.getRemainingQuota(user.uid);
      setQuotaRemaining(remaining);
    }
  };

  const loadChatHistory = async () => {
    if (!user) return;
    
    // Load from Firestore
    const firestoreHistory = await loadUserHistory(user.uid);
    
    if (firestoreHistory.length > 0) {
      const restoredMessages = firestoreHistory.map((item, index) => ({
        id: index + 1,
        type: item.role === 'user' ? 'user' : 'bot',
        content: item.content,
        timestamp: item.timestamp?.toDate ? item.timestamp.toDate() : new Date()
      }));
      setMessages(restoredMessages);
      chatHistory = firestoreHistory;
    } else if (chatHistory.length > 0) {
      // Fallback to localStorage
      const restoredMessages = chatHistory.map((item, index) => ({
        id: index + 1,
        type: item.role === 'user' ? 'user' : 'bot',
        content: item.content,
        image: item.image,
        timestamp: new Date(item.timestamp)
      }));
      setMessages(restoredMessages);
    } else {
      // Show welcome message
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
      if (user) {
        saveToFirestore(user.uid, user.displayName, 'assistant', welcomeMsg);
      }
    }
  };



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !currentImage) return;
    
    // Rate limiting: minimum 2 seconds between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < 2000) {
      const waitTime = Math.ceil((2000 - timeSinceLastRequest) / 1000);
      const warningMsg = {
        id: Date.now(),
        type: 'bot',
        content: `⏳ Vui lòng chờ ${waitTime} giây nữa...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, warningMsg]);
      return;
    }
    lastRequestTime.current = now;



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
    if (user) {
      saveToFirestore(user.uid, user.displayName, 'user', inputText, currentImage);
    }
    
    const sentText = inputText;
    const sentImage = currentImage;
    setInputText('');
    setCurrentImage(null);
    setIsLoading(true);

    try {
      let responseText;
      if (sentImage) {
        const imagePrompt = sentText || "Hãy chẩn đoán tình trạng cây này và đề xuất cách điều trị.";
        responseText = await analyzePlantImage(sentImage.data, imagePrompt);
      } else {
        responseText = await chatWithAgriBot(chatHistory, sentText);
      }
      
      const fullText = responseText || 'Xin lỗi, Lạc Lạc không thể trả lời lúc này.';
      
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
      
      addToHistory('assistant', fullText);
      if (user) {
        saveToFirestore(user.uid, user.displayName, 'assistant', fullText);
        await updateQuota(); // Update quota after AI call
      }
    } catch (error) {
      console.error('ChatBot error:', error);
      setIsTyping(false);
      
      let errorMessage = 'Xin lỗi, Lạc Lạc đang gặp sự cố kỹ thuật. Bạn thử lại sau nhé!';
      
      // Handle quota exceeded error
      if (error.message?.includes('Đã hết lượt sử dụng')) {
        errorMessage = `😔 Bạn đã hết lượt hỏi AI hôm nay!

🌱 Gói hiện tại: TẬP SỰ (20 câu hỏi/ngày)

🚀 Nâng cấp gói cao hơn:
• NHÀ NÔNG: 100 câu hỏi/ngày - 99k/tháng
• CHUYÊN GIA: Không giới hạn - 149k/tháng

🔄 Hoặc chờ đến ngày mai để có lại 20 lượt miễn phí!`;
      } else if (error.message?.includes('429') || error.status === 429) {
        errorMessage = '😔 Lạc Lạc đã trả lời quá nhiều hôm nay! Vui lòng chờ 1-2 phút rồi thử lại nhé. (Giới hạn API: 15 requests/phút)';
      } else if (error.message?.includes('API key')) {
        errorMessage = '⚠️ API key không hợp lệ. Vui lòng kiểm tra lại cấu hình!';
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      addToHistory('assistant', errorMessage);
      if (user) {
        saveToFirestore(user.uid, user.displayName, 'assistant', errorMessage);
      }
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

  // Audio helper functions
  const createPcmBlob = (data) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const decode = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data, ctx) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  // Voice/Video Call Functions
  const handleVoiceCall = async () => {
    setCallType('voice');
    setIsCalling(true);
    setCallStatus('connecting');
    // Bắt đầu ngay lập tức để giảm độ trễ
    startLiveSession(false);
  };

  const startLiveSession = async (withVideo = false) => {
    try {
      aiRef.current = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      inputCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      const constraints = withVideo 
        ? { audio: true, video: { facingMode: 'user' } }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (withVideo && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          systemInstruction: getSystemInstruction() + "\n\nBạn đang trong cuộc gọi trực tiếp. Hãy trả lời ngắn gọn, thân thiện như đang nói chuyện.",
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        },
        callbacks: {
          onopen: () => {
            setCallStatus('connected');
            processAudioInput(stream);
            addCallMessage('system', '🎙️ Đã kết nối voice call với Lạc Lạc AI');
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              playAudioOutput(audioData);
            }
          },
          onclose: () => console.log("Live session closed"),
          onerror: (e) => {
            console.error("Live session error:", e);
            endCall();
          }
        }
      });
      
      sessionRef.current = sessionPromise;
      
    } catch (error) {
      console.error('Failed to start live session:', error);
      setCallStatus('ended');
      setTimeout(() => {
        setIsCalling(false);
        setCallStatus('idle');
      }, 1000);
    }
  };

  const processAudioInput = (stream) => {
    if (!inputCtxRef.current) return;
    
    const source = inputCtxRef.current.createMediaStreamSource(stream);
    const processor = inputCtxRef.current.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (isMuted) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      sessionRef.current?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };
    
    source.connect(processor);
    processor.connect(inputCtxRef.current.destination);
  };

  const playAudioOutput = async (base64Audio) => {
    if (!outputCtxRef.current || outputCtxRef.current.state === 'closed') return;
    
    try {
      const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtxRef.current);
      const source = outputCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputCtxRef.current.destination);
      
      const now = outputCtxRef.current.currentTime;
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  const addCallMessage = (type, content) => {
    const message = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const captureAndSend = () => {
    if (!canvasRef.current || !videoRef.current || !sessionRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    sessionRef.current.then((session) => {
      session.sendRealtimeInput({ 
        media: { mimeType: 'image/jpeg', data: base64 }
      });
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    setCallStatus('ended');
    
    sessionRef.current?.then((session) => session.close());
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (inputCtxRef.current?.state !== 'closed') inputCtxRef.current?.close();
    if (outputCtxRef.current?.state !== 'closed') outputCtxRef.current?.close();
    
    addCallMessage('system', '📞 Cuộc gọi đã kết thúc. Cảm ơn bạn đã trò chuyện với Lạc Lạc!');
    
    setTimeout(() => {
      setIsCalling(false);
      setCallStatus('idle');
      setIsCameraOn(false);
      setIsMuted(false);
    }, 1000);
  };





  if (!isOpen) {
    return null;
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
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              {quotaRemaining ? `Còn ${quotaRemaining.aiQuestions} câu hỏi` : 'Trợ lý nông nghiệp'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleVoiceCall()}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Gọi thoại với Lạc Lạc"
          >
            📞
          </button>
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
              alignSelf: message.type === 'user' ? 'flex-end' : message.type === 'system' ? 'center' : 'flex-start',
              maxWidth: message.type === 'system' ? '90%' : '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: message.type === 'user' ? '#E0F7FA' : message.type === 'system' ? '#FFF3E0' : '#f5f5f5',
              fontSize: '14px',
              lineHeight: '1.4',
              fontStyle: message.type === 'system' ? 'italic' : 'normal',
              textAlign: message.type === 'system' ? 'center' : 'left'
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
          disabled={isLoading || (!inputText.trim() && !currentImage) || cooldown > 0}
          style={{
            background: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: (isLoading || cooldown > 0) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: (isLoading || cooldown > 0) ? 0.6 : 1
          }}
        >
          {isLoading ? '...' : cooldown > 0 ? cooldown : '➤'}
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
                  localStorage.removeItem('nonglac_user_context');
                  userContext = { location: "Vietnam", crops: [], gardenInfo: "", hasConsent: false };
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

      {/* Voice/Video Call Overlay */}
      {isCalling && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          color: 'white',
          zIndex: 2000
        }}>
          {/* Call Header */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: callStatus === 'connected' ? '#4CAF50' : '#FFA726',
                animation: 'pulse 2s infinite'
              }} />
              {callStatus === 'connecting' ? 'Đang kết nối...' : 
               callStatus === 'connected' ? 'Đã kết nối' : 
               callStatus === 'ended' ? 'Đã kết thúc' : 'Đang gọi...'}
            </div>
          </div>

          {/* Avatar and Info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '60px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              marginBottom: '20px',
              border: '4px solid rgba(255,255,255,0.2)',
              animation: callStatus === 'connecting' ? 'pulse 2s infinite' : 'none'
            }}>
              🌱
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Lạc Lạc AI
            </h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
              {callType === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại'}
            </p>
          </div>

          {/* Video Preview (for video calls) */}
          {callType === 'video' && (
            <div style={{
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '200px',
                  height: '150px',
                  backgroundColor: '#333',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {callStatus === 'connected' && (
                <button
                  onClick={captureAndSend}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    border: 'none',
                    borderRadius: '20px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📷 Gửi ảnh cho AI
                </button>
              )}
            </div>
          )}

          {/* Call Controls */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}>
            {callStatus === 'connected' && (
              <>
                <button
                  onClick={toggleMute}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: isMuted ? 'rgba(244, 67, 54, 0.8)' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={isMuted ? "Bật mic" : "Tắt mic"}
                >
                  {isMuted ? '🔇' : '🎤'}
                </button>
                {callType === 'video' && (
                  <button
                    onClick={toggleCamera}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: !isCameraOn ? 'rgba(244, 67, 54, 0.8)' : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={isCameraOn ? "Tắt camera" : "Bật camera"}
                  >
                    {isCameraOn ? '📹' : '📷'}
                  </button>
                )}
              </>
            )}
            
            <button
              onClick={endCall}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f44336',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
              }}
              title="Kết thúc cuộc gọi"
            >
              📞
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default ChatBot;