/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type, LiveServerMessage, Modality, Blob as GenAIBlob } from "@google/genai";

// --- DOM Elements ---
const messageList = document.getElementById('message-list') as HTMLDivElement;
const messageForm = document.getElementById('message-form') as HTMLFormElement;
const messageInput = document.getElementById('message-input') as HTMLInputElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const suggestedQuestionsContainer = document.getElementById('suggested-questions-container') as HTMLDivElement;

const imageInput = document.getElementById('image-input') as HTMLInputElement;
const uploadButton = document.getElementById('upload-button') as HTMLButtonElement;
const imagePreviewContainer = document.getElementById('image-preview-container') as HTMLDivElement;
const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
const removeImageButton = document.getElementById('remove-image-button') as HTMLButtonElement;
const micButton = document.getElementById('mic-button') as HTMLButtonElement;

// Header Controls
const toggleVoiceBtn = document.getElementById('toggle-voice-btn') as HTMLButtonElement;
const openTrainBtn = document.getElementById('open-train-btn') as HTMLButtonElement;

// Live Mode Elements
const startLiveButton = document.getElementById('start-live-button') as HTMLButtonElement;
const liveContainer = document.getElementById('live-container') as HTMLDivElement;
const liveVideo = document.getElementById('live-video') as HTMLVideoElement;
const liveCanvas = document.getElementById('live-canvas') as HTMLCanvasElement;
const liveStatusText = document.getElementById('live-status-text') as HTMLSpanElement;
const endLiveButton = document.getElementById('end-live-button') as HTMLButtonElement;
const replayLiveButton = document.getElementById('replay-live-button') as HTMLButtonElement;
const switchCameraBtn = document.getElementById('switch-camera-button') as HTMLButtonElement;
const liveMascot = document.getElementById('live-mascot') as HTMLImageElement;
const liveTranscription = document.getElementById('live-transcription') as HTMLDivElement;

// Start Modal
const startModal = document.getElementById('start-modal') as HTMLDivElement;
const btnStartApp = document.getElementById('btn-start-app') as HTMLButtonElement;

// Training Modal
const trainingModal = document.getElementById('training-modal') as HTMLDivElement;
const trainingInput = document.getElementById('training-input') as HTMLTextAreaElement;
const saveTrainingBtn = document.getElementById('save-training-btn') as HTMLButtonElement;
const closeTrainingBtn = document.getElementById('close-training-btn') as HTMLButtonElement;

// --- State ---
let isLoading = false;
let chat = null;
let currentImageBase64: string | null = null;
let currentImageMimeType: string | null = null;
let userContext = {
    location: "Vietnam",
    crops: [] as string[],
    gardenInfo: "", // Stores info about garden size, soil, etc.
    notes: "",
    hasConsent: false // Permission to store conversation
};
let isAutoSpeakEnabled = true;
let userTrainingData = ""; // Permanent user instructions

// TTS State
let ttsAudioContext: AudioContext | null = null;
let ttsSources = new Set<AudioBufferSourceNode>();
let ttsSessionId = 0; // Tracks the current speech sequence to handle cancellation

// Speech-to-Text State
let recognition: any = null;
let isRecording = false;

// Live State
let liveSessionPromise: Promise<any> | null = null;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let videoStream: MediaStream | null = null;
let audioStream: MediaStream | null = null;
let videoInterval: number | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();
let currentFacingMode: 'user' | 'environment' = 'user';

// --- Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Load user settings
try {
    const savedContext = localStorage.getItem('nonglac_user_context');
    if (savedContext) {
        userContext = JSON.parse(savedContext);
    }
    const savedAutoSpeak = localStorage.getItem('nonglac_auto_speak');
    if (savedAutoSpeak !== null) {
        isAutoSpeakEnabled = savedAutoSpeak === 'true';
    }
    const savedTraining = localStorage.getItem('nonglac_user_training');
    if (savedTraining) {
        userTrainingData = savedTraining;
    }
} catch (e) {
    console.warn("Failed to load user settings");
}

function updateVoiceToggleUI() {
    const iconSpan = toggleVoiceBtn.querySelector('span');
    if (iconSpan) {
        iconSpan.textContent = isAutoSpeakEnabled ? 'volume_up' : 'volume_off';
    }
}
updateVoiceToggleUI();

toggleVoiceBtn.addEventListener('click', () => {
    isAutoSpeakEnabled = !isAutoSpeakEnabled;
    localStorage.setItem('nonglac_auto_speak', isAutoSpeakEnabled.toString());
    updateVoiceToggleUI();
    if (!isAutoSpeakEnabled) {
        stopSpeaking();
    }
});

function saveUserContext() {
    localStorage.setItem('nonglac_user_context', JSON.stringify(userContext));
    syncDataToCloud(userContext);
}

// Mock Cloud Sync Function
async function syncDataToCloud(data: any) {
    // This is where we send data to the centralized cloud link
    const CLOUD_ENDPOINT = "https://api.nonglac.vn/v1/collect-user-data"; // Placeholder
    console.log("Syncing data to cloud:", data);
    
    try {
        // In a real app, un-comment the fetch call
        /*
        await fetch(CLOUD_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        */
    } catch (e) {
        console.warn("Cloud sync failed (expected in demo):", e);
    }
}

function updateUserContextFromText(text: string) {
    const lower = text.toLowerCase();
    let updated = false;

    // Detect Consent
    const consentKeywords = ['đồng ý', 'ok', 'được', 'nhất trí', 'ừ', 'oke', 'yes', 'cho phép'];
    if (!userContext.hasConsent) {
        if (consentKeywords.some(kw => lower.includes(kw))) {
            userContext.hasConsent = true;
            updated = true;
        }
    }

    // Detect Crops
    const cropKeywords = ['lúa', 'cà phê', 'sầu riêng', 'bơ', 'hoa hồng', 'dâu tây', 'rau', 'cúc', 'lan', 'tiêu', 'điều', 'chè'];
    cropKeywords.forEach(crop => {
        if (lower.includes(crop) && !userContext.crops.includes(crop)) {
            userContext.crops.push(crop);
            updated = true;
        }
    });

    // Detect Garden Info (Simple keyword check)
    if (lower.includes('ha') || lower.includes('mét vuông') || lower.includes('m2') || lower.includes('sào') || lower.includes('công')) {
        if (!userContext.gardenInfo.includes('Diện tích')) {
             userContext.gardenInfo += ` [Diện tích đề cập: ${text.substring(0, 60)}...]`;
             updated = true;
        }
    }
    if (lower.includes('đất đỏ') || lower.includes('đất cát') || lower.includes('đất thịt') || lower.includes('bazan')) {
         if (!userContext.gardenInfo.includes('Loại đất')) {
             userContext.gardenInfo += ` [Loại đất: ${text.substring(0, 60)}...]`;
             updated = true;
        }
    }

    if (updated) saveUserContext();
}

// System Instruction Construction
const getSystemInstruction = () => {
    return `Bạn tên là "LẠC LẠC". Bạn là một chuyên gia nông nghiệp đến từ Đà Lạt.
    
    PHONG CÁCH GIAO TIẾP (QUAN TRỌNG):
    - Giọng điệu: Nhẹ nhàng, từ tốn, lịch sự, hiếu khách (đặc trưng người Đà Lạt).
    - Xưng hô: Tự xưng là "Lạc Lạc" và gọi người dùng là "bạn" hoặc "nhà mình".
    - KHÔNG dùng từ ngữ địa phương miền Tây. Dùng từ phổ thông nhẹ nhàng, thanh lịch.
    - Luôn thể hiện sự quan tâm tinh tế đến khu vườn của người dùng.
    
    NHIỆM VỤ CỐT LÕI:
    1. Chẩn đoán bệnh cây trồng và tư vấn kỹ thuật canh tác.
    2. Tạo hình ảnh minh họa nếu được yêu cầu.
    3. THU THẬP DỮ LIỆU & CÁ NHÂN HÓA:
       - Nếu chưa có sự đồng ý (Consent): Hãy khéo léo xin phép lưu trữ dữ liệu để học hỏi.
       - Nếu chưa biết loại cây hay quy mô: Hãy hỏi thăm tinh tế.
    
    THÔNG TIN NGƯỜI DÙNG HIỆN TẠI:
    - Đã đồng ý thu thập dữ liệu: ${userContext.hasConsent ? "RỒI" : "CHƯA (Cần hỏi)"}.
    - Cây trồng: ${userContext.crops.join(', ') || 'Chưa rõ'}.
    - Thông tin vườn: ${userContext.gardenInfo || 'Chưa rõ'}.
    
    *** KIẾN THỨC/QUY TẮC NGƯỜI DÙNG ĐÃ DẠY (TUÂN THỦ TUYỆT ĐỐI): ***
    ${userTrainingData || "(Chưa có kiến thức đào tạo nào)"}

    *** QUY TẮC PHẢN HỒI SIÊU TỐC (VERY IMPORTANT): ***
    Để Lạc Lạc trả lời nhanh và người dùng dễ nghe, hãy tuân thủ:
    1. TRẢ LỜI NGẮN GỌN: Mỗi lượt chỉ nói 1-3 câu ngắn. Tuyệt đối KHÔNG viết đoạn văn dài.
    2. CHIA NHỎ VẤN ĐỀ: Đừng cố giải quyết hết mọi thứ trong một lần. Hãy đưa ra nhận định sơ bộ, sau đó ĐẶT CÂU HỎI để dẫn dắt người dùng.
    3. ĐỊNH HƯỚNG: Thay vì giải thích lý thuyết, hãy hỏi về tình trạng cụ thể để tư vấn sát sườn hơn.
    
    Ví dụ Tốt: "Lạc Lạc thấy lá cây bị vàng, có thể do thiếu nước hoặc nấm. Đất nhà mình đang khô hay ẩm ướt vậy bạn?"
    Ví dụ Xấu (Cấm): "Bệnh vàng lá có nhiều nguyên nhân như thiếu nitơ, thiếu sắt, úng nước... Để khắc phục bạn cần làm bước 1... bước 2... bước 3..." (Quá dài).

    QUY TẮC NGUỒN (GROUNDING):
    - KHÔNG đọc đường dẫn (URL) hoặc liệt kê danh sách link trong nội dung văn bản trả lời. Hệ thống tự hiển thị link bên dưới.
    `;
};


// --- Helper Functions ---

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (match) => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
    });
}

// Clean text function to remove markdown symbols like * and # for better TTS and Display
function cleanText(text: string) {
    if (!text) return "";
    // Remove bold/italic markers (*, **, ***)
    let cleaned = text.replace(/\*\*/g, "").replace(/\*/g, "");
    // Remove header markers (###, ##, #) at start of lines
    cleaned = cleaned.replace(/^#+\s/gm, "");
    return cleaned.trim();
}

function splitIntoSentences(text: string): string[] {
    // Regex matches sequences of characters ending in punctuation or newline
    // Includes the punctuation in the match
    const matches = text.match(/[^.!?\n]+[.!?\n]*\s*/g);
    return matches ? matches.map(s => s.trim()).filter(s => s.length > 0) : [text];
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
               resolve(reader.result.split(',')[1]); 
            } else {
               reject(new Error('Failed to convert blob to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createPcmBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


// --- Main App Logic (Text Chat) ---

async function initializeChat() {
    try {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: getSystemInstruction(),
                tools: [{ googleSearch: {} }] // Enable Google Search grounding
            },
        });
        
        // Custom Onboarding Message
        const welcomeText = "Chào bạn! Mình là Lạc Lạc đây. Để Lạc Lạc có thể đồng hành và hỗ trợ nhà mình tốt nhất, bạn cho phép mình lưu lại cuộc trò chuyện này để học hỏi thêm nhé? À, hiện tại vườn nhà mình đang trồng cây gì và quy mô khoảng bao nhiêu vậy ạ?";
        
        addBotMessage({
            type: 'text',
            content: welcomeText
        });

    } catch (error) {
        console.error("Initialization failed:", error);
    }
}

// --- Image Generation Logic ---
async function generateAIImage(prompt: string) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: prompt,
            config: {
                // responseMimeType is not supported for nano banana series (gemini-2.5-flash-image)
            }
        });
        
        let imageUrl = null;
        if(response.candidates?.[0]?.content?.parts) {
             for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
                    break;
                }
             }
        }
        return imageUrl;

    } catch (e) {
        console.error("Image gen error", e);
        return null;
    }
}

// --- Chat UI Functions ---

function addUserMessage(text, imageUrl = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user');
    
    let htmlContent = '';
    if (imageUrl) {
        htmlContent += `<img src="${imageUrl}" alt="Uploaded image" />`;
    }
    if (text) {
        htmlContent += `<div>${escapeHTML(text)}</div>`;
    }
    
    messageElement.innerHTML = htmlContent;
    messageList.appendChild(messageElement);
    scrollToBottom();
    
    // Update context
    if (text) updateUserContextFromText(text);
}

function addBotMessage(response) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot');

    let contentHTML = '';

    // Handle Grounding (Search Sources)
    let sourcesHTML = '';
    if (response.groundingMetadata?.groundingChunks) {
        const uniqueLinks = new Map();
        
        // Dedup links based on URI
        response.groundingMetadata.groundingChunks.forEach(c => {
            if (c.web?.uri && c.web?.title) {
                uniqueLinks.set(c.web.uri, c.web.title);
            }
        });

        if (uniqueLinks.size > 0) {
            const links = Array.from(uniqueLinks.entries())
                .map(([uri, title]) => `<a href="${uri}" target="_blank" class="source-link"><span class="material-symbols-rounded source-icon">link</span>${escapeHTML(title)}</a>`)
                .join('');
            
            sourcesHTML = `
                <div class="grounding-sources">
                    <div class="sources-title">Tài liệu tham khảo:</div>
                    <div class="sources-list">${links}</div>
                </div>`;
        }
    }

    // Clean the text for display (removes * and #)
    const cleanedContent = cleanText(response.content);

    if (response.image) {
        contentHTML = `<div class="message-content-wrapper">${escapeHTML(cleanedContent)}</div><img src="${response.image}" style="max-width:100%; margin-top:10px; border-radius:10px;">`;
    } else {
        contentHTML = `<div class="message-content-wrapper">${escapeHTML(cleanedContent)}</div>`;
    }

    // Add Manual Speak Button and Status Indicator
    const controlsHTML = `
        <div class="tts-controls">
            <button class="tts-btn" aria-label="Đọc tin nhắn">
                <span class="material-symbols-rounded">volume_up</span>
            </button>
            <span class="tts-status"></span>
        </div>
    `;

    messageElement.innerHTML = contentHTML + sourcesHTML + controlsHTML;
    messageList.appendChild(messageElement);
    scrollToBottom();
    
    // Attach Event Listener to the newly created button
    const ttsBtn = messageElement.querySelector('.tts-btn') as HTMLButtonElement;
    const ttsStatus = messageElement.querySelector('.tts-status') as HTMLSpanElement;

    if (ttsBtn && response.content) {
        ttsBtn.addEventListener('click', () => {
            speakText(response.content, ttsStatus);
        });
    }

    // Auto Text-to-Speech logic
    if (response.content && !response.isHistory && isAutoSpeakEnabled) {
        // For auto-speak, we don't show the "converting" text to avoid clutter
        speakText(response.content);
    }
}

function stopSpeaking() {
    // Increment session ID to invalidate any pending fetch/schedule loops
    ttsSessionId++;

    // 1. Stop native browser speech
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    // 2. Stop all scheduled/playing Gemini TTS sources
    ttsSources.forEach(source => {
        try {
            source.stop();
        } catch(e) { /* ignore already stopped */ }
    });
    ttsSources.clear();
}

async function speakText(text: string, statusElement: HTMLElement | null = null) {
    stopSpeaking(); // Ensure silence before starting
    const currentSession = ttsSessionId;

    const cleanContent = cleanText(text);
    if (!cleanContent) return;

    // Initialize Context if needed
    if (!ttsAudioContext) {
        ttsAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (ttsAudioContext.state === 'suspended') {
        await ttsAudioContext.resume();
    }

    // Optimization: Split text into sentences for streaming-like low latency
    let chunks = [];
    if (cleanContent.length < 100) {
        chunks = [cleanContent];
    } else {
        chunks = splitIntoSentences(cleanContent);
    }

    if (statusElement) statusElement.textContent = "Đang chuyển đổi...";

    let nextStartTime = ttsAudioContext.currentTime + 0.1; // Buffer slightly for smooth start

    for (let i = 0; i < chunks.length; i++) {
        // Stop if session was cancelled (e.g., user typed new message)
        if (ttsSessionId !== currentSession) break;
        
        const chunk = chunks[i];

        try {
            // Fetch audio for this chunk
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: { parts: [{ text: chunk }] },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    }
                }
            });

            // Check cancellation again after await
            if (ttsSessionId !== currentSession) break;

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                // Clear loading status once first chunk is ready
                if (i === 0 && statusElement) statusElement.textContent = "";

                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ttsAudioContext,
                    24000,
                    1
                );

                const source = ttsAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ttsAudioContext.destination);

                // Schedule seamless playback
                // If fetching took too long, play immediately, otherwise schedule at end of previous
                const scheduleTime = Math.max(nextStartTime, ttsAudioContext.currentTime);
                source.start(scheduleTime);
                
                // Track source for cancellation
                ttsSources.add(source);
                source.onended = () => ttsSources.delete(source);

                // Update next start time
                nextStartTime = scheduleTime + audioBuffer.duration;
            }

        } catch (error) {
            console.warn("TTS Chunk Error:", error);
            // Continue to next chunk even if one fails
        }
    }

    if (statusElement) statusElement.textContent = "";
}

function addLoadingBubble() {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot', 'loading');
    messageElement.textContent = "Lạc Lạc đang suy nghĩ";
    messageList.appendChild(messageElement);
    scrollToBottom();
    return messageElement;
}

async function handleSendMessage(event) {
  event.preventDefault();
  
  // IMMEDIATELY stop any ongoing speech when user interacts
  stopSpeaking();
  
  if (isLoading || !chat) return;

  const userMessage = messageInput.value.trim();
  
  if (!userMessage && !currentImageBase64) return;

  const displayImageUrl = currentImageBase64 
    ? `data:${currentImageMimeType};base64,${currentImageBase64}` 
    : null;

  addUserMessage(userMessage, displayImageUrl);
  
  messageInput.value = '';
  const sentImageBase64 = currentImageBase64;
  const sentImageMimeType = currentImageMimeType;
  clearImageSelection();
  suggestedQuestionsContainer.style.display = 'none';

  setLoading(true);
  const loadingBubble = addLoadingBubble();

  try {
    let responseText = "";
    let generatedImageUrl = null;
    let groundingMetadata = null;

    // Check if user wants an image generation (simple heuristic)
    const lowerMsg = userMessage.toLowerCase();
    const isImageGenRequest = lowerMsg.includes('vẽ') || lowerMsg.includes('tạo ảnh') || lowerMsg.includes('hình minh họa');

    if (isImageGenRequest) {
        // Separate Flow for Image Generation
        loadingBubble.textContent = "Lạc Lạc đang vẽ";
        generatedImageUrl = await generateAIImage(userMessage);
        responseText = "Hình vẽ của bạn đây nè. Bạn xem có ưng ý không nhé?";
    } 
    else {
        // Normal Multimodal Chat
        let result;
        if (sentImageBase64) {
             result = await chat.sendMessage({ 
                message: [
                    { text: userMessage || "Xem giúp mình cây này bị bệnh gì với?" },
                    { inlineData: { mimeType: sentImageMimeType, data: sentImageBase64 } }
                ]
            });
        } else {
            result = await chat.sendMessage({ message: userMessage });
        }
        responseText = result.text;
        groundingMetadata = result.candidates?.[0]?.groundingMetadata;
    }

    loadingBubble.remove();
    addBotMessage({
        type: 'text',
        content: responseText,
        image: generatedImageUrl,
        groundingMetadata: groundingMetadata
    });

  } catch (error) {
    console.error('Error sending message:', error);
    loadingBubble.textContent = 'Mạng bị chập chờn rồi. Bạn hỏi lại giúp Lạc Lạc nhé.';
  } finally {
    setLoading(false);
  }
}

async function handleFileSelect(event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    currentImageMimeType = file.type;
    currentImageBase64 = await fileToBase64(file);
    imagePreview.src = `data:${currentImageMimeType};base64,${currentImageBase64}`;
    imagePreviewContainer.classList.remove('hidden');
    messageInput.focus();
  } catch (error) {
    console.error("Error reading file:", error);
  }
}

function clearImageSelection() {
  currentImageBase64 = null;
  currentImageMimeType = null;
  imageInput.value = '';
  imagePreview.src = '';
  imagePreviewContainer.classList.add('hidden');
}

function setLoading(state) {
  isLoading = state;
  sendButton.disabled = state;
  messageInput.disabled = state;
  if (state) {
     messageInput.placeholder = 'Đang xử lý...';
  } else {
     messageInput.placeholder = 'Hỏi Lạc Lạc...';
  }
}

function scrollToBottom() {
  messageList.scrollTop = messageList.scrollHeight;
}

// --- Speech to Text Logic ---
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        micButton.style.display = 'none';
        return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isRecording = true;
        micButton.classList.add('listening');
        messageInput.placeholder = 'Đang nghe...';
    };

    recognition.onend = () => {
        isRecording = false;
        micButton.classList.remove('listening');
        if (!isLoading) messageInput.placeholder = 'Hỏi Lạc Lạc hoặc gửi ảnh cây bệnh...';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            // Append to existing text with a space
            messageInput.value = messageInput.value ? messageInput.value + ' ' + transcript : transcript;
            messageInput.focus();
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        isRecording = false;
        micButton.classList.remove('listening');
    };
}

initSpeechRecognition();

micButton.addEventListener('click', () => {
    if (!recognition) return;
    
    if (isRecording) {
        recognition.stop();
    } else {
        stopSpeaking(); // Stop any audio playback when starting to record
        try {
            recognition.start();
        } catch (e) {
            console.error("Cannot start recognition", e);
        }
    }
});

// --- Training Modal Logic ---
openTrainBtn.addEventListener('click', () => {
    trainingInput.value = userTrainingData;
    trainingModal.classList.remove('hidden');
});

closeTrainingBtn.addEventListener('click', () => {
    trainingModal.classList.add('hidden');
});

saveTrainingBtn.addEventListener('click', () => {
    const newData = trainingInput.value.trim();
    userTrainingData = newData;
    localStorage.setItem('nonglac_user_training', userTrainingData);
    
    // Sync to cloud (mock)
    syncDataToCloud({ ...userContext, trainingData: userTrainingData });

    // Show simple feedback
    alert("Đã lưu kiến thức! Lạc Lạc sẽ ghi nhớ điều này.");
    trainingModal.classList.add('hidden');
    
    // Re-initialize chat to apply new system instruction immediately for next turn
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: getSystemInstruction(),
            tools: [{ googleSearch: {} }]
        },
    });
});

// --- Live Functionality ---

// Helper to set visual state of the mascot
function setLiveState(state: 'listening' | 'thinking' | 'speaking') {
    liveMascot.classList.remove('thinking', 'talking');
    
    if (state === 'listening') {
        liveStatusText.innerText = "LẠC LẠC đang nghe...";
    } else if (state === 'thinking') {
        liveStatusText.innerText = "LẠC LẠC đang suy nghĩ...";
        liveMascot.classList.add('thinking');
    } else if (state === 'speaking') {
        liveStatusText.innerText = "LẠC LẠC đang nói...";
        liveMascot.classList.add('talking');
    }
}

async function toggleCamera() {
    if (!videoStream) return;
    
    // Stop current tracks
    videoStream.getTracks().forEach(track => track.stop());
    
    // Flip mode
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    try {
        // Request new stream
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: currentFacingMode } 
        });
        liveVideo.srcObject = videoStream;
        
        // Update mirror effect (Mirror front cam, normal back cam)
        if (currentFacingMode === 'user') {
            liveVideo.style.transform = 'scaleX(-1)';
        } else {
            liveVideo.style.transform = 'none';
        }

    } catch (err) {
        console.error("Error switching camera:", err);
        alert("Không thể chuyển đổi camera.");
    }
}

async function startLiveSession() {
    startModal.classList.add('hidden'); // Hide modal if open
    stopSpeaking(); // Stop any pending TTS from Chat mode

    try {
        liveContainer.classList.remove('hidden');
        setLiveState('listening');

        // 1. Audio In
        inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 2. Video In
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: currentFacingMode } 
        });
        liveVideo.srcObject = videoStream;
        // Apply mirror if default is user
        if (currentFacingMode === 'user') {
            liveVideo.style.transform = 'scaleX(-1)';
        }
        
        // 3. Audio Out
        outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        nextStartTime = 0;
        
        // 4. Connect
        liveSessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    // Check if session was closed before connection established (race condition)
                    if (!inputAudioContext || !audioStream) {
                        console.warn("Session stopped before onopen fired.");
                        return;
                    }
                    
                    // Audio Stream
                    const source = inputAudioContext.createMediaStreamSource(audioStream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        liveSessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);

                    // Video Stream (Low FPS)
                    const ctx = liveCanvas.getContext('2d');
                    videoInterval = window.setInterval(() => {
                        if (!liveVideo.videoWidth) return;
                        liveCanvas.width = liveVideo.videoWidth;
                        liveCanvas.height = liveVideo.videoHeight;
                        ctx.drawImage(liveVideo, 0, 0);
                        
                        liveCanvas.toBlob(async (blob) => {
                             if(blob) {
                                 const base64Data = await blobToBase64(blob);
                                 liveSessionPromise.then(session => {
                                     session.sendRealtimeInput({
                                         media: { mimeType: 'image/jpeg', data: base64Data }
                                     });
                                 });
                             }
                        }, 'image/jpeg', 0.5);
                    }, 1000); 

                    // --- NEW: Immediately trigger greeting ---
                    liveSessionPromise.then((session) => {
                        session.sendRealtimeInput({
                            content: {
                                parts: [{ text: "Chào bà con! Hãy giới thiệu bản thân và hỏi xem bà con cần giúp gì không?" }]
                            }
                        });
                    });
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Check if user turn is complete (implies model is now "thinking")
                    if (message.serverContent?.turnComplete) {
                        setLiveState('thinking');
                    }

                    // Handle Audio
                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        setLiveState('speaking');
                        
                        if (!outputAudioContext) return;
                        
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        
                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            outputAudioContext,
                            24000,
                            1
                        );
                        
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        source.addEventListener('ended', () => {
                            sources.delete(source);
                            if (sources.size === 0) {
                                setLiveState('listening');
                            }
                        });
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        sources.add(source);
                    }

                    // Handle Transcription (User & Model)
                    if (message.serverContent?.outputTranscription) {
                        liveTranscription.innerText = "Lạc Lạc: " + message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.inputTranscription) {
                        // Update context silently during live call to learn about the user
                        updateUserContextFromText(message.serverContent.inputTranscription.text);
                    }
                    
                    const interrupted = message.serverContent?.interrupted;
                    if (interrupted) {
                         sources.forEach(src => src.stop());
                         sources.clear();
                         nextStartTime = 0;
                         setLiveState('listening');
                    }
                },
                onclose: () => {
                    stopLiveSession();
                },
                onerror: (err) => {
                    console.error('Live error:', err);
                    liveStatusText.innerText = "Lỗi kết nối.";
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: getSystemInstruction(),
                inputAudioTranscription: {}, 
                outputAudioTranscription: {} 
            }
        });

    } catch (err) {
        console.error("Failed to start live session", err);
        alert("Cần quyền truy cập Camera và Micro để trò chuyện với Lạc Lạc.");
        stopLiveSession();
    }
}

function handleReplayLastResponse() {
    if (!liveSessionPromise) return;
    
    // Simulate a user text request to repeat the last sentence
    liveSessionPromise.then((session) => {
        session.sendRealtimeInput({
            content: {
                parts: [{ text: "Bạn nói lại câu vừa rồi giúp mình với." }]
            }
        });
    });
}

function stopLiveSession() {
    liveContainer.classList.add('hidden');
    liveMascot.classList.remove('talking', 'thinking');
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
    if (videoInterval) {
        clearInterval(videoInterval);
        videoInterval = null;
    }
    if (inputAudioContext) {
        inputAudioContext.close();
        inputAudioContext = null;
    }
    if (outputAudioContext) {
        outputAudioContext.close();
        outputAudioContext = null;
    }
    if (liveSessionPromise) {
        liveSessionPromise.then(session => session.close()).catch(()=>{});
        liveSessionPromise = null;
    }
    sources.clear();
}

// --- Event Listeners ---
messageForm.addEventListener('submit', handleSendMessage);

suggestedQuestionsContainer.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('suggested-question')) {
        messageInput.value = target.textContent || '';
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        messageForm.dispatchEvent(submitEvent);
    }
});

uploadButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleFileSelect);
removeImageButton.addEventListener('click', (e) => {
  e.preventDefault();
  clearImageSelection();
});

startLiveButton.addEventListener('click', startLiveSession);
endLiveButton.addEventListener('click', stopLiveSession);
replayLiveButton.addEventListener('click', handleReplayLastResponse);
switchCameraBtn.addEventListener('click', toggleCamera);

// Start App Button - NOW enters the text chat with intro audio instead of Live
btnStartApp.addEventListener('click', () => {
    startModal.classList.add('hidden');
    // Initialize Chat (which triggers the voice intro)
    initializeChat();
});