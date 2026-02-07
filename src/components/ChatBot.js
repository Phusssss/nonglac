import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CallRounded, 
  VideocamRounded, 
  DeleteOutlineRounded, 
  CloseRounded, 
  AddCircleRounded, 
  SentimentSatisfiedAltRounded, 
  SendRounded 
} from '@mui/icons-material';
import { GoogleGenAI, Modality } from '@google/genai';
import { callLiveAI } from '../services/aiWrapper';
import { useAuth } from '../hooks/useAuth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { collection, addDoc, query, where, orderBy, limit, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import subscriptionService from '../services/subscriptionService';
import { chatWithAgriBot, analyzePlantImage, SUGGESTED_QUESTIONS } from '../services/geminiService';
import EnhancedLoginModal from './enhanced/EnhancedLoginModal';
import LacLacMascot from './LacLacMascot';


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

// Delete user's chat history from Firestore
const deleteUserHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'chatHistory'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error deleting history from Firestore:', error);
    return false;
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

// Camera helper functions
const checkCameraSupport = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

const stopCamera = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
};

const applyAdvancedConstraints = async (track) => {
  try {
    const capabilities = track.getCapabilities();
    const advancedConstraints = {};
    if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) advancedConstraints.focusMode = 'continuous';
    if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) advancedConstraints.exposureMode = 'continuous';
    if (capabilities.whiteBalanceMode && capabilities.whiteBalanceMode.includes('continuous')) advancedConstraints.whiteBalanceMode = 'continuous';
    if (Object.keys(advancedConstraints).length > 0) await track.applyConstraints(advancedConstraints);
  } catch (error) {
    console.warn('Failed to apply advanced constraints:', error);
  }
};

const initializeCamera = async (facingMode) => {
  try {
    const constraints = {
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: facingMode },
      audio: false
    };
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Camera initialization error:', error);
    throw error;
  }
};

const ChatBot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requireAuthForAI, showLoginModal, setShowLoginModal } = useAuthGuard();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenChatBot = () => setIsOpen(true);
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
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('voice');
  const [callStatus, setCallStatus] = useState('idle');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [showFlash, setShowFlash] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastRequestTime = useRef(0);
  
  const cameraVideoRef = useRef(null);
  const cameraCanvasRef = useRef(null);
  const sessionRef = useRef(null);
  const inputCtxRef = useRef(null);
  const outputCtxRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const isSessionActiveRef = useRef(false);
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    if (isOpen && messages.length === 0) loadChatHistory();
    if (isOpen && user) updateQuota();
  }, [isOpen, user]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateQuota = async () => {
    if (user) {
      const remaining = await subscriptionService.getRemainingQuota(user.uid);
      setQuotaRemaining(remaining);
    }
  };

  const loadChatHistory = async () => {
    if (!user) return;
    const firestoreHistory = await loadUserHistory(user.uid);
    if (firestoreHistory.length > 0) {
      setMessages(firestoreHistory.map((item, index) => ({
        id: index + 1, type: item.role === 'user' ? 'user' : 'bot', content: item.content, timestamp: item.timestamp?.toDate ? item.timestamp.toDate() : new Date()
      })));
      chatHistory = firestoreHistory;
    } else {
      const welcomeMsg = `Chào bạn! Mình là Lạc Lạc. Hôm nay mình có thể giúp gì cho vườn nhà mình? 🌱`;
      const welcomeMessage = { id: 1, type: 'bot', content: welcomeMsg, timestamp: new Date() };
      setMessages([welcomeMessage]);
      addToHistory('assistant', welcomeMsg);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !currentImage) return;
    
    return requireAuthForAI(async () => {
      const now = Date.now();
      if (now - lastRequestTime.current < 2000) return;
      lastRequestTime.current = now;

      const userMessage = { 
        id: Date.now(), 
        type: 'user', 
        content: inputText, 
        image: currentImage ? { ...currentImage } : null, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      const sentText = inputText;
      const sentImage = currentImage;
      
      setInputText('');
      setCurrentImage(null);
      setIsLoading(true);

      try {
        let responseText;
        if (sentImage) {
          responseText = await analyzePlantImage(sentImage.data, sentText || "Chẩn đoán bệnh cây");
        } else {
          responseText = await chatWithAgriBot(chatHistory, sentText);
        }
        
        if (responseText === null) { 
          setIsLoading(false); 
          return; 
        }
        
        addToHistory('user', sentText, sentImage);
        const botMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { id: botMessageId, type: 'bot', content: responseText, timestamp: new Date() }]);
        addToHistory('assistant', responseText);
        
        if (user) {
          await saveToFirestore(user.uid, user.displayName, 'user', sentText, sentImage);
          await saveToFirestore(user.uid, user.displayName, 'assistant', responseText);
        }
        
        await updateQuota();
      } catch (error) {
        console.error('ChatBot error:', error);
      }
      setIsLoading(false);
    });
  };

  const handleClearChat = async () => {
    if (!user) return;
    setIsLoading(true);
    const success = await deleteUserHistory(user.uid);
    if (success) {
      setMessages([]);
      chatHistory = [];
      localStorage.removeItem('nonglac_chat_history');
      const welcomeMsg = "Đã xóa lịch sử. Lạc Lạc sẵn sàng bắt đầu cuộc trò chuyện mới cùng bà con! 🌱";
      setMessages([{ id: Date.now(), type: 'bot', content: welcomeMsg, timestamp: new Date() }]);
    }
    setIsLoading(false);
    setShowClearConfirm(false);
  };

  const decodeAudioData = async (data, ctx) => {
    // Ensure byte alignment for Int16Array
    const buffer = data.buffer;
    const offset = data.byteOffset;
    const length = data.byteLength;
    const actualData = new Int16Array(buffer.slice(offset, offset + length));
    
    const audioBuffer = ctx.createBuffer(1, actualData.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < actualData.length; i++) {
      channelData[i] = actualData[i] / 32768.0;
    }
    return audioBuffer;
  };

  const handleVoiceCall = async () => {
    requireAuthForAI(() => {
      setCallType('voice');
      setIsCalling(true);
      setCallStatus('connecting');
      startLiveSession(false);
    });
  };

  const handleVideoCall = async () => {
    requireAuthForAI(() => {
      // Navigate to the full-screen AI Video Call page
      navigate('/ai-video-call');
      setIsOpen(false);
    });
  };

  const startLiveSession = async (withVideo = false) => {
    try {
      inputCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      const constraints = withVideo ? { audio: true, video: { facingMode: 'user' } } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (withVideo && videoRef.current) videoRef.current.srcObject = stream;
      
      const liveConfig = {
        model: 'gemini-2.5-flash-lite-native-audio-preview-01-2026',
        config: {
          systemInstruction: getSystemInstruction() + `\nQUY TẮC CUỘC GỌI: Cực kỳ ngắn gọn, thân thiện.`,
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        },
        callbacks: {
          onopen: () => { isSessionActiveRef.current = true; setCallStatus('connected'); processAudioInput(stream); },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              if (outputCtxRef.current.state === 'suspended') await outputCtxRef.current.resume();
              const audioBuffer = await decodeAudioData(new Uint8Array(atob(audioData).split("").map(c => c.charCodeAt(0))), outputCtxRef.current);
              const source = outputCtxRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtxRef.current.destination);
              const now = outputCtxRef.current.currentTime;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), audioBuffer.duration * 1000);
            }
          },
          onclose: () => endCall(),
          onerror: () => endCall()
        }
      };
      sessionRef.current = await callLiveAI(liveConfig, user.uid);
    } catch (error) {
      console.error('Call Error:', error);
      endCall();
    }
  };

  const processAudioInput = (stream) => {
    const source = inputCtxRef.current.createMediaStreamSource(stream);
    const processor = inputCtxRef.current.createScriptProcessor(2048, 1, 1);
    
    processor.onaudioprocess = async (e) => {
      if (isMuted || !isSessionActiveRef.current) {
        setIsUserSpeaking(false);
        return;
      }
      
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Basic VAD (Voice Activity Detection)
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
      const rms = Math.sqrt(sum / inputData.length);
      setIsUserSpeaking(rms > 0.015);

      const l = inputData.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
      
      const pcmBlob = { 
        data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))), 
        mimeType: 'audio/pcm;rate=16000' 
      };
      
      if (sessionRef.current && isSessionActiveRef.current) {
        try { await sessionRef.current.sendRealtimeInput({ media: pcmBlob }); } catch (e) {}
      }
    };
    
    source.connect(processor);
    processor.connect(inputCtxRef.current.destination);
    processorRef.current = processor;
    sourceRef.current = source;
  };

  const endCall = () => {
    isSessionActiveRef.current = false;
    setCallStatus('ended');
    if (processorRef.current) { processorRef.current.onaudioprocess = null; processorRef.current.disconnect(); }
    if (sourceRef.current) sourceRef.current.disconnect();
    if (sessionRef.current) { try { sessionRef.current.close(); } catch(e) {} }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (inputCtxRef.current?.state !== 'closed') inputCtxRef.current?.close();
    if (outputCtxRef.current?.state !== 'closed') outputCtxRef.current?.close();
    setTimeout(() => { setIsCalling(false); setCallStatus('idle'); }, 1500);
  };

  const toggleMute = () => { setIsMuted(!isMuted); };
  const toggleCamera = () => { if (streamRef.current) { const vt = streamRef.current.getVideoTracks()[0]; if (vt) { vt.enabled = !vt.enabled; setIsCameraOn(vt.enabled); } } };
  const handleOpenCamera = () => requireAuthForAI(async () => { const s = await initializeCamera('environment'); setCameraStream(s); setIsCameraOpen(true); if (cameraVideoRef.current) cameraVideoRef.current.srcObject = s; });
  const handleCloseCamera = () => { stopCamera(cameraStream); setIsCameraOpen(false); setCameraStream(null); };
  const handleSwitchCamera = async () => { const nfm = facingMode === 'user' ? 'environment' : 'user'; stopCamera(cameraStream); const s = await initializeCamera(nfm); setFacingMode(nfm); setCameraStream(s); if (cameraVideoRef.current) cameraVideoRef.current.srcObject = s; };
  const handleCapture = () => { setShowFlash(true); setTimeout(() => setShowFlash(false), 150); const canvas = cameraCanvasRef.current; const video = cameraVideoRef.current; canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d').drawImage(video, 0, 0); const b64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]; setCurrentImage({ data: b64, type: 'image/jpeg', url: `data:image/jpeg;base64,${b64}` }); handleCloseCamera(); };

  return (
    <React.Fragment>
      <div style={{
        position: 'fixed', bottom: '80px', right: '20px', width: '360px', height: '580px', backgroundColor: 'white', borderRadius: '24px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 1000, display: (isOpen && !isCalling) ? 'flex' : 'none', flexDirection: 'column', fontFamily: 'Inter, sans-serif',
        overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)'
      }}>
        {/* Header - Zalo/Messenger Style */}
        <div style={{ background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)' }}>
                <LacLacMascot size="small" status="idle" />
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#44b700', border: '2px solid white' }}></div>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.3px' }}>Lạc Lạc AI</div>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: '500' }}>
                {quotaRemaining ? `${quotaRemaining.aiQuestions} lượt hỏi` : 'Đang hoạt động'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={handleVoiceCall} className="hover:bg-white/20 transition-colors" style={{ background: 'none', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CallRounded sx={{ fontSize: 20 }} />
            </button>
            <button onClick={handleVideoCall} className="hover:bg-white/20 transition-colors" style={{ background: 'none', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VideocamRounded sx={{ fontSize: 20 }} />
            </button>
            <button onClick={() => setShowClearConfirm(true)} className="hover:bg-white/20 transition-colors" style={{ background: 'none', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteOutlineRounded sx={{ fontSize: 18 }} />
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 transition-colors" style={{ background: 'none', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloseRounded sx={{ fontSize: 22 }} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F0F2F5' }}>
          {messages.map(m => (
            <div key={m.id} style={{ 
              alignSelf: m.type === 'user' ? 'flex-end' : 'flex-start', 
              maxWidth: '85%', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                padding: '10px 14px', 
                borderRadius: m.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                backgroundColor: m.type === 'user' ? '#0084FF' : 'white', 
                color: m.type === 'user' ? 'white' : '#1C1E21',
                fontSize: '14.5px',
                lineHeight: '1.4',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                {m.image && (
                  <div style={{ marginBottom: '8px', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={m.image.url} alt="User upload" style={{ maxWidth: '100%', display: 'block' }} />
                  </div>
                )}
                {m.content}
              </div>
              <div style={{ fontSize: '11px', color: '#65676B', marginTop: '4px', padding: '0 4px' }}>
                {m.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', backgroundColor: 'white', padding: '10px 16px', borderRadius: '18px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview Overlay */}
        {currentImage && (
          <div style={{ padding: '8px 16px', backgroundColor: 'white', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
              <img src={currentImage.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              <button 
                onClick={() => setCurrentImage(null)}
                style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#65676B', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#65676B' }}>Ảnh đã chọn. Nhấn gửi để phân tích.</div>
          </div>
        )}

        {/* Input Area - Messenger Style */}
        <div style={{ padding: '12px 16px', backgroundColor: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()} 
              style={{ background: 'none', border: 'none', color: '#0084FF', padding: '4px', cursor: 'pointer', display: 'flex' }}
            >
              <AddCircleRounded sx={{ fontSize: 26 }} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*"
              onChange={(e) => { 
                const f = e.target.files[0]; 
                if (f) { 
                  const r = new FileReader(); 
                  r.onload = () => setCurrentImage({ data: r.result.split(',')[1], type: f.type, url: r.result }); 
                  r.readAsDataURL(f); 
                } 
                e.target.value = ''; // Reset to allow re-selection
              }} 
              style={{ display: 'none' }} 
            />
            
            <div style={{ flex: 1, backgroundColor: '#F0F2F5', borderRadius: '20px', padding: '0 12px', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                placeholder="Nhắn tin cho Lạc Lạc..." 
                style={{ flex: 1, padding: '10px 0', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '15px' }} 
              />
              <SentimentSatisfiedAltRounded sx={{ color: '#0084FF', fontSize: 20, cursor: 'pointer', opacity: inputText ? 1 : 0.5 }} />
            </div>

            <button 
              type="submit" 
              disabled={!inputText.trim() && !currentImage}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: (inputText.trim() || currentImage) ? '#0084FF' : '#B0B3B8', 
                padding: '4px', 
                cursor: 'pointer',
                display: 'flex',
                transition: 'transform 0.2s'
              }}
              className="active:scale-90"
            >
              <SendRounded sx={{ fontSize: 28 }} />
            </button>
          </form>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '300px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Xóa trò chuyện?</div>
            <div style={{ fontSize: '14px', color: '#65676B', marginBottom: '20px' }}>Toàn bộ lịch sử trò chuyện sẽ bị xóa vĩnh viễn và không thể khôi phục.</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowClearConfirm(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button 
                onClick={handleClearChat}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#FF3B30', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {isCalling && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0B0C0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '100px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50', boxShadow: '0 0 10px #4CAF50' }} />
              <span style={{ fontWeight: '500' }}>Chế độ Offline</span>
            </div>
          </div>
          <button onClick={endCall} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', fontSize: '32px', cursor: 'pointer' }}>×</button>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
            <div style={{ backgroundColor: 'white', padding: '12px 28px', borderRadius: '16px', color: '#111315', fontSize: '16px', fontWeight: '700', position: 'relative', boxShadow: '0 15px 35px rgba(0,0,0,0.4)', animation: 'bounce 2s infinite' }}>
              {isTyping ? 'Đang trả lời...' : 'Chạm vào tui đi'}
              <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid white' }} />
            </div>
            <div onClick={async () => { if (outputCtxRef.current?.state === 'suspended') await outputCtxRef.current.resume(); }}>
              <LacLacMascot status={callStatus === 'connecting' ? 'thinking' : isTyping ? 'speaking' : 'idle'} size="large" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', letterSpacing: '4px', color: 'white', opacity: 0.4, fontWeight: '800', marginBottom: '8px' }}>CHẠM ĐỂ TƯƠNG TÁC (OFFLINE)</div>
            </div>
          </div>
          <div style={{ width: '100%', padding: '60px 24px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <button onClick={toggleCamera} style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '24px' }}>{isCameraOn ? '📹' : '📷'}</button>
              <button onClick={endCall} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FF3B30', border: 'none', color: 'white', fontSize: '36px', boxShadow: '0 0 30px rgba(255, 59, 48, 0.4)', transform: 'rotate(135deg)' }}>📞</button>
              <button onClick={toggleMute} style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '24px' }}>{isMuted ? '🔇' : '🎤'}</button>
            </div>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>📸 Chụp ảnh cây trồng</div>
            <button onClick={handleCloseCamera} style={{ background: 'none', border: 'none', color: 'white', fontSize: '32px' }}>×</button>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <video ref={cameraVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
          </div>
          <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px' }}>
            <button onClick={handleSwitchCamera} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '30px' }}>🔄</button>
            <button onClick={handleCapture} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'white', border: '5px solid #4CAF50' }} />
            <button onClick={handleCloseCamera} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '30px' }}>×</button>
          </div>
          <canvas ref={cameraCanvasRef} style={{ display: 'none' }} />
        </div>
      )}

      <EnhancedLoginModal open={showLoginModal} onCancel={() => setShowLoginModal(false)} title="Đăng nhập AI" message="Đăng nhập để trò chuyện với Lạc Lạc" feature="sử dụng AI" />
    </React.Fragment>
  );
};

export default ChatBot;