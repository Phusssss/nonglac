import { GoogleGenAI } from '@google/genai';
import { 
  scrapeNNVNHomepage, 
  scrapeNNVNCategory, 
  scrapeAllNNVNCategories,
  CATEGORIES 
} from './nnvnScraper';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });





// Crawl tin tức từ Google Search (sử dụng Gemini với Google Search)
export const crawlAgriNews = async (maxResults = 5) => {
  try {
    const searchQueries = [
      'tin tức nông nghiệp Việt Nam hôm nay',
      'giá nông sản mới nhất',
      'kỹ thuật trồng trọt hiện đại',
      'chính sách nông nghiệp 2024',
      'xuất khẩu nông sản Việt Nam'
    ];

    const results = [];

    for (const query of searchQueries.slice(0, maxResults)) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Tìm kiếm thông tin mới nhất về "${query}" và tóm tắt thành bài viết ngắn cho nông dân Việt Nam. 
          Bao gồm:
          - Tiêu đề ngắn gọn, hấp dẫn (tối đa 60 ký tự)
          - Nội dung 100-150 từ, tập trung vào điểm chính
          - Thông tin thực tế, cập nhật
          - Phù hợp cho nông dân Việt Nam
          
          Format:
          TIÊU ĐỀ: [tiêu đề]
          NỘI DUNG: [nội dung]
          NGUỒN: [nguồn tin]`,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        const text = response.text;
        const titleMatch = text.match(/TIÊU ĐỀ:\s*(.+)/);
        const contentMatch = text.match(/NỘI DUNG:\s*([\s\S]+?)(?=NGUỒN:|$)/);
        const sourceMatch = text.match(/NGUỒN:\s*(.+)/);

        if (titleMatch && contentMatch) {
          results.push({
            title: titleMatch[1].trim(),
            content: contentMatch[1].trim(),
            source: sourceMatch ? sourceMatch[1].trim() : 'Google Search',
            category: getCategoryFromContent(contentMatch[1]),
            crawledAt: new Date()
          });
        }

        // Delay để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error crawling query "${query}":`, error);
      }
    }



    return results;
  } catch (error) {
    console.error('Error in crawlAgriNews:', error);
    return [];
  }
};

// Tạo bài viết từ chủ đề
export const generateAgriPost = async (topic) => {
  try {
    const prompt = `Viết một bài viết hướng dẫn chi tiết về "${topic}" cho nông dân Việt Nam.

    Yêu cầu:
    - Tiêu đề ngắn gọn, thu hút (tối đa 50 ký tự)
    - Nội dung từ 200-300 từ, đi thẳng vào vấn đề
    - Thông tin thực tế, khoa học nhưng dễ hiểu
    - Phù hợp với điều kiện Việt Nam
    - Ngôn ngữ đơn giản, gần gũi
    - Có lời khuyên cụ thể, thực tế

    Format:
    TIÊU ĐỀ: [tiêu đề]
    NỘI DUNG: [nội dung chi tiết với các đoạn văn]`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const response = result.text;
    const titleMatch = response.match(/TIÊU ĐỀ:\s*(.+)/);
    const contentMatch = response.match(/NỘI DUNG:\s*([\s\S]+)/);

    return {
      title: titleMatch ? titleMatch[1].trim() : `Hướng dẫn ${topic}`,
      content: contentMatch ? contentMatch[1].trim() : response,
      category: getCategoryFromTopic(topic),
      source: 'AI Generated',
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating post:', error);
    return null;
  }
};

// Lấy giá nông sản từ các nguồn
export const crawlAgriPrices = async () => {
  try {
    const priceQuery = `Tìm kiếm giá nông sản Việt Nam hôm nay (lúa, gạo, cà phê, tiêu, cao su, rau củ) từ các thị trường chính.
    
    Format kết quả:
    SẢN PHẨM: [tên sản phẩm]
    GIÁ: [giá hiện tại]
    ĐƠN VỊ: [đơn vị tính]
    THỊ TRƯỜNG: [tên thị trường]
    BIẾN ĐỘNG: [tăng/giảm so với hôm qua]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: priceQuery,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    // Parse response để lấy dữ liệu giá
    const text = response.text;
    const prices = [];
    
    // Regex để parse dữ liệu giá
    const pricePattern = /SẢN PHẨM:\s*(.+)\nGIÁ:\s*(.+)\nĐƠN VỊ:\s*(.+)\nTHỊ TRƯỜNG:\s*(.+)\nBIẾN ĐỘNG:\s*(.+)/g;
    let match;
    
    while ((match = pricePattern.exec(text)) !== null) {
      prices.push({
        productName: match[1].trim(),
        currentPrice: parseFloat(match[2].replace(/[^\d]/g, '')) || 0,
        unit: match[3].trim(),
        market: match[4].trim(),
        trend: match[5].trim(),
        updatedAt: new Date()
      });
    }

    return prices;
  } catch (error) {
    console.error('Error crawling prices:', error);
    return [];
  }
};

// Tạo bài viết về thời tiết nông vụ
export const generateWeatherPost = async () => {
  try {
    const weatherQuery = `Tạo bài viết về dự báo thời tiết và lời khuyên nông vụ cho nông dân Việt Nam trong tuần tới.
    
    Bao gồm:
    - Dự báo thời tiết ngắn gọn cho tuần tới
    - Lời khuyên cụ thể cho nông dân (2-3 điểm chính)
    - Cảnh báo rủi ro nếu có
    - Hành động cần làm ngay
    
    Format:
    TIÊU ĐỀ: [tiêu đề]
    NỘI DUNG: [nội dung chi tiết]`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: weatherQuery,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const response = result.text;
    const titleMatch = response.match(/TIÊU ĐỀ:\s*(.+)/);
    const contentMatch = response.match(/NỘI DUNG:\s*([\s\S]+)/);

    return {
      title: titleMatch ? titleMatch[1].trim() : 'Dự báo thời tiết nông vụ',
      content: contentMatch ? contentMatch[1].trim() : response,
      category: 'Thời tiết',
      source: 'Weather Forecast',
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating weather post:', error);
    return null;
  }
};

// Phân loại danh mục từ nội dung
const getCategoryFromContent = (content) => {
  const categories = {
    'Thị trường': ['giá', 'thị trường', 'xuất khẩu', 'nhập khẩu', 'kinh tế'],
    'Kỹ thuật': ['trồng', 'chăn nuôi', 'kỹ thuật', 'phương pháp', 'công nghệ'],
    'Chính sách': ['chính sách', 'quy định', 'luật', 'hỗ trợ', 'chính phủ'],
    'Thời tiết': ['thời tiết', 'khí hậu', 'mưa', 'nắng', 'bão'],
    'Tin tức': ['tin tức', 'sự kiện', 'hoạt động', 'hội nghị', 'triển lãm']
  };

  const lowerContent = content.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return category;
    }
  }
  
  return 'Tin tức';
};

// Phân loại danh mục từ chủ đề
const getCategoryFromTopic = (topic) => {
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes('giá') || lowerTopic.includes('thị trường')) return 'Thị trường';
  if (lowerTopic.includes('trồng') || lowerTopic.includes('kỹ thuật')) return 'Kỹ thuật';
  if (lowerTopic.includes('chính sách') || lowerTopic.includes('quy định')) return 'Chính sách';
  if (lowerTopic.includes('thời tiết') || lowerTopic.includes('khí hậu')) return 'Thời tiết';
  
  return 'Hướng dẫn';
};

// Scrape tin tức từ Báo Nông Nghiệp Việt Nam (không dùng AI)
export const scrapeNNVNNews = async (category = null, maxResults = 10) => {
  try {
    let articles = [];
    
    if (category && CATEGORIES[category]) {
      articles = await scrapeNNVNCategory(category);
      console.log(`📊 Real articles from ${category}: ${articles.length}`);
    } else {
      articles = await scrapeNNVNHomepage();
      console.log(`📊 Real articles from homepage: ${articles.length}`);
    }
    
    return articles.slice(0, maxResults);
  } catch (error) {
    console.error('Error scraping NNVN news:', error);
    return [];
  }
};

// Scrape tất cả danh mục từ NNVN
export const scrapeAllNNVNNews = async () => {
  try {
    return await scrapeAllNNVNCategories();
  } catch (error) {
    console.error('Error scraping all NNVN news:', error);
    return [];
  }
};

// Danh sách chủ đề nông nghiệp phổ biến (ngắn gọn hơn)
export const POPULAR_AGRI_TOPICS = [
  'trồng lúa mùa khô hiệu quả',
  'chăn nuôi gà thả và lợi nhuận',
  'rau sạch ban công cho gia đình',
  'phòng sâu bệnh tự nhiên',
  'kỹ thuật ủ phân compost',
  'chọn giống lúa năng suất cao',
  'nuôi cá trong ruộng lúa',
  'trồng nấm rơm tại nhà'
];

// Export danh mục NNVN
export { CATEGORIES as NNVN_CATEGORIES };

const crawlerService = {
  crawlAgriNews,
  generateAgriPost,
  crawlAgriPrices,
  generateWeatherPost,
  scrapeNNVNNews,
  scrapeAllNNVNNews,
  POPULAR_AGRI_TOPICS
};

export default crawlerService;