import { GoogleGenAI } from '@google/genai';
import { callAI, callImageAI } from './aiWrapper';
import { auth } from '../firebase/config';

// Initialize Gemini Client
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export const formatAIResponse = (text) => {
  if (!text) return '';
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-800 font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-600">$1</em>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc marker:text-green-500">$1</li>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-green-700 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-green-800 mt-5 mb-3 border-b border-green-100 pb-1">$1</h2>')
    .replace(/\n/g, '<br />');
  return formatted;
};

const SYSTEM_INSTRUCTION_AGRI = `
Bạn là AgriBot, một chuyên gia nông nghiệp AI thân thiện và giàu kinh nghiệm của diễn đàn NôngLạc.
Nhiệm vụ của bạn là giúp đỡ nông dân Việt Nam về kỹ thuật trồng trọt, chăn nuôi, nhận diện sâu bệnh, và phân tích thị trường.
Trả lời ngắn gọn, súc tích, dễ hiểu, ưu tiên dùng các thuật ngữ nông nghiệp phổ biến tại Việt Nam.
Nếu người dùng hỏi về giá cả thị trường, hãy cố gắng đưa ra thông tin ước lượng hoặc khuyên họ kiểm tra nguồn tin địa phương nếu bạn không chắc chắn.
`;

export const analyzePlantImage = async (base64Image, userPrompt = "Hãy chẩn đoán bệnh cho cây này và đề xuất cách điều trị.") => {
  try {
    const user = auth.currentUser;
    if (!user) {
      // Trả về null để component xử lý auth guard
      return null;
    }

    const config = {
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `${SYSTEM_INSTRUCTION_AGRI}\n\n${userPrompt}`
          }
        ]
      }
    };

    const response = await callImageAI(config, user.uid);
    return response.text || "Xin lỗi, tôi không thể phân tích hình ảnh này lúc này.";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw error;
  }
};

export const chatWithAgriBot = async (history, newMessage) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      // Trả về null để ChatBot component xử lý auth guard
      return null;
    }

    const config = {
      model: 'gemini-2.5-flash',
      contents: `${SYSTEM_INSTRUCTION_AGRI}\n\nLịch sử: ${JSON.stringify(history)}\n\nTin nhắn mới: ${newMessage}`
    };

    const response = await callAI(config, user.uid, 'askAI');
    return response.text || "Xin lỗi, tôi không hiểu ý bạn.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const getMarketInsights = async (query) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      // Trả về null để component xử lý auth guard
      return null;
    }

    const config = {
      model: 'gemini-2.5-flash',
      contents: `Giá ${query} Việt Nam hôm nay. Trả lời dưới 100 từ, tập trung giá cả.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    };

    const response = await callAI(config, user.uid, 'marketInsights');
    return response.text || "Không tìm thấy thông tin thị trường phù hợp.";
  } catch (error) {
    console.error("Gemini Market Search Error:", error);
    throw error;
  }
};

export const getWeatherForecast = async (location = "Việt Nam") => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Thời tiết hiện tại và dự báo ngắn gọn 24h tới tại ${location}. Đưa ra 1 lời khuyên nông nghiệp ngắn gọn (1 câu) dựa trên thời tiết này (ví dụ: mưa thì không bón phân). Định dạng output: Nhiệt độ | Tình trạng | Lời khuyên.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text || "Không cập nhật được thời tiết.";
  } catch (error) {
    console.error("Gemini Weather Error:", error);
    return "Lỗi kết nối thời tiết.";
  }
};

export const findPlaces = async (query, lat, lng) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      // Trả về null để component xử lý auth guard
      return null;
    }

    const config = {
      model: 'gemini-2.5-flash',
      contents: `Tìm: ${query}. Trả lời dưới 30 từ.`,
      config: {
        tools: [{ googleMaps: {} }],
      }
    };

    if (lat && lng) {
      config.config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      };
    }

    const response = await callAI(config, user.uid, 'agriMap');

    const places = [];
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk) => {
        if (chunk.maps?.uri) {
          places.push({
            title: chunk.maps.title || "Địa điểm trên bản đồ",
            uri: chunk.maps.uri
          });
        }
      });
    }

    return {
      text: response.text || "Không tìm thấy địa điểm phù hợp.",
      places: places
    };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    throw error;
  }
};

// Legacy functions for backward compatibility
export const replyToComment = async (commentContent, commentAuthor, postContext) => {
  try {
    const history = [];
    const prompt = `
      Ngữ cảnh bài viết: "${postContext}".
      Người dùng ${commentAuthor} đã bình luận: "${commentContent}".
      Là AgriBot, hãy trả lời trực tiếp cho bình luận của ${commentAuthor} một cách lịch sự, hữu ích và ngắn gọn. Bắt đầu bằng "Chào @${commentAuthor},...".
    `;
    
    return await chatWithAgriBot(history, prompt);
  } catch (error) {
    console.error('Gemini API Error:', error);
    const snippet = commentContent.substring(0, 50);
    return `Chào @${commentAuthor}, cảm ơn bạn đã chia sẻ về "${snippet}...". Đây là một góc nhìn rất hay và thiết thực.`;
  }
};
