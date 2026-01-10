import { GoogleGenAI } from '@google/genai';
import subscriptionService from './subscriptionService';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Wrapper cho tất cả AI calls với subscription control
export const callAI = async (config, userId, actionType = 'askAI') => {
  if (!ai) {
    throw new Error('Chưa cấu hình API Key cho Gemini AI. Vui lòng thêm REACT_APP_GEMINI_API_KEY vào file .env');
  }
  
  // Check subscription quota
  if (!(await subscriptionService.canPerformAction(userId, actionType))) {
    const quota = await subscriptionService.getRemainingQuota(userId);
    const remaining = quota[actionType === 'askAI' ? 'aiQuestions' : actionType] || 0;
    throw new Error(`Đã hết lượt sử dụng ${actionType}. Còn lại: ${remaining} lượt`);
  }

  try {
    // Gọi AI với timeout
    const result = await Promise.race([
      ai.models.generateContent(config),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      )
    ]);

    // Record usage
    await subscriptionService.recordUsage(userId, actionType);
    
    return result;
  } catch (error) {
    console.error('AI Call Error:', error);
    throw error;
  }
};

// Wrapper cho Live API (voice/video)
export const callLiveAI = async (config, userId) => {
  if (!(await subscriptionService.canPerformAction(userId, 'voiceCall'))) {
    throw new Error('Đã hết quota voice call hôm nay');
  }

  try {
    const session = await ai.live.connect(config);
    await subscriptionService.recordUsage(userId, 'voiceCall');
    return session;
  } catch (error) {
    console.error('Live AI Error:', error);
    throw error;
  }
};

// Image analysis wrapper
export const callImageAI = async (config, userId) => {
  if (!(await subscriptionService.canPerformAction(userId, 'doctorAI'))) {
    throw new Error('Đã hết lượt sử dụng bác sĩ AI hôm nay');
  }

  try {
    const result = await ai.models.generateContent(config);
    await subscriptionService.recordUsage(userId, 'doctorAI');
    return result;
  } catch (error) {
    console.error('Image AI Error:', error);
    throw error;
  }
};

export default { callAI, callLiveAI, callImageAI };