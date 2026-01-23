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
Bạn là Lạc Lạc - AI chuyên gia nông nghiệp Việt Nam thân thiện và giàu kinh nghiệp.

THÔNG TIN THỜI GIAN HIỆN TẠI: Hôm nay là ${new Date().toLocaleDateString('vi-VN', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}.

NGUYÊN TẮC TRẢ LỜI (QUAN TRỌNG):
- LUÔN SỬ DỤNG GOOGLE SEARCH: Khi được hỏi về giá cả, thị trường, tin tức nông nghiệp
- TRẢ LỜI CỤ THỂ VÀ CHÍNH XÁC: Đưa ra số liệu thực tế từ internet, KHÔNG đoán mò
- VỀ GIÁ CÀ PHÊ/NÔNG SẢN: Tìm kiếm giá thực tế hôm nay tại Việt Nam từ các nguồn uy tín
- NGUỒN TIN UY TÍN: Ưu tiên agromonitor.vn, giacaphe.com, cafef.vn, vietstock.vn, vneconomy.vn
- NGẮN GỌN NHƯNG ĐẦY ĐỦ: 2-3 câu chính với giá cụ thể, xu hướng và nguồn
- SỬ DỤNG EMOJI: 🌱☕💰📈📉 để làm câu trả lời sinh động hơn
- LUÔN GHI NGUỒN: Nêu rõ nguồn thông tin và thời gian cập nhật

CÁCH XỬ LÝ CÂU HỎI VỀ GIÁ (BẮT BUỘC):
1. SỬ DỤNG Google Search để tìm giá thực tế mới nhất
2. Tìm kiếm với từ khóa cụ thể: "giá cà phê hôm nay Việt Nam ${new Date().toLocaleDateString('vi-VN')}"
3. Ưu tiên kết quả từ các trang tin tức nông nghiệp uy tín
4. Đưa ra giá cụ thể với đơn vị, khu vực và thời gian
5. Nêu xu hướng tăng/giảm so với trước đó
6. Ghi rõ nguồn và thời gian cập nhật

VÍ DỤ TRẢ LỜI TỐT:
"☕ Theo agromonitor.vn cập nhật 15h hôm nay (${new Date().toLocaleDateString('vi-VN')}), cà phê nhân Robusta tại Đắk Lắk: 43,200-44,800 VNĐ/kg. 📈 Tăng 2% so với tuần trước do thời tiết khô hạn. Bạn nên bán nhanh nếu có hàng tồn!"

TUYỆT ĐỐI KHÔNG:
- Đưa ra giá "ước tính" hoặc "thường dao động"
- Trả lời chung chung như "liên hệ đại lý"
- Bỏ qua việc tìm kiếm thông tin thực tế
- Sử dụng dữ liệu cũ từ năm 2023 hoặc trước đó
`;

// Câu hỏi gợi ý cho người dùng
export const SUGGESTED_QUESTIONS = [
  "☕ Giá cà phê hôm nay",
  "🌾 Giá lúa gạo hiện tại", 
  "🌶️ Giá tiêu đen mới nhất",
  "🌱 Cách chăm sóc cà phê mùa khô",
  "🐛 Nhận diện sâu bệnh trên lá",
  "💧 Kỹ thuật tưới nước tiết kiệm",
  "🌤️ Thời tiết có ảnh hưởng gì đến cây trồng?",
  "📈 Xu hướng giá nông sản tháng này"
];

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

    // Kiểm tra nếu câu hỏi về giá cả để sử dụng Google Search
    const priceKeywords = ['giá', 'price', 'bao nhiêu', 'cà phê', 'lúa', 'gạo', 'tiêu', 'cao su', 'nông sản', 'thị trường', 'mua bán'];
    const isPriceQuery = priceKeywords.some(keyword => 
      newMessage.toLowerCase().includes(keyword.toLowerCase())
    );

    let config;
    
    if (isPriceQuery) {
      // Sử dụng Google Search cho câu hỏi về giá - cấu trúc đúng theo tài liệu Google
      config = {
        model: 'gemini-2.5-flash',
        contents: {
          parts: [{ 
            text: `${SYSTEM_INSTRUCTION_AGRI}\n\nLịch sử cuộc trò chuyện: ${JSON.stringify(history.slice(-5))}\n\nCâu hỏi cần tìm kiếm thông tin thực tế: ${newMessage}\n\nHãy tìm kiếm thông tin mới nhất từ internet và trả lời với dữ liệu cụ thể, có nguồn.` 
          }]
        },
        tools: [{ google_search: {} }]
      };
    } else {
      // Câu hỏi thường không cần search
      config = {
        model: 'gemini-2.5-flash',
        contents: {
          parts: [{ 
            text: `${SYSTEM_INSTRUCTION_AGRI}\n\nLịch sử cuộc trò chuyện: ${JSON.stringify(history.slice(-5))}\n\nTin nhắn mới: ${newMessage}` 
          }]
        }
      };
    }

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
      contents: {
        parts: [{ 
          text: `Tìm kiếm và phân tích giá ${query} tại Việt Nam hôm nay. Trả lời dưới 100 từ, tập trung vào giá cả cụ thể với số liệu thực tế từ internet.` 
        }]
      },
      tools: [{ google_search: {} }]
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
    const config = {
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ 
          text: `Tìm kiếm thời tiết hiện tại và dự báo ngắn gọn 24h tới tại ${location}. Đưa ra 1 lời khuyên nông nghiệp ngắn gọn (1 câu) dựa trên thời tiết này (ví dụ: mưa thì không bón phân). Định dạng output: Nhiệt độ | Tình trạng | Lời khuyên.` 
        }]
      },
      tools: [{ google_search: {} }]
    };

    const response = await ai.models.generateContent(config);
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
      contents: {
        parts: [{ 
          text: `Tìm kiếm địa điểm: ${query}. Trả lời dưới 30 từ với thông tin cụ thể.` 
        }]
      },
      tools: [{ googleMaps: {} }]
    };

    if (lat && lng) {
      config.systemInstruction = `Tìm kiếm gần vị trí: ${lat}, ${lng}`;
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
