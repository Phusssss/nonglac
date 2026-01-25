// Scraper cho Báo Nông Nghiệp Việt Nam (nongnghiepmoitruong.vn)
// Không sử dụng AI, chỉ parse HTML thuần



const NNVN_BASE_URL = 'https://nongnghiepmoitruong.vn';

// Danh mục chính từ website
const CATEGORIES = {
  'nong-nghiep': 'Nông nghiệp',
  'chan-nuoi': 'Chăn nuôi', 
  'trong-trot': 'Trồng trọt',
  'thuy-san': 'Thủy sản',
  'khuyen-nong': 'Khuyến nông',
  'khoa-hoc---cong-nghe': 'Khoa học - Công nghệ',
  'lam-nghiep': 'Lâm nghiệp',
  'moi-truong': 'Môi trường',
  'kinh-te': 'Kinh tế',
  'thoi-su': 'Thời sự'
};

// Scrape tin tức từ trang chủ
export const scrapeNNVNHomepage = async () => {
  try {
    console.log('🔍 Scraping NNVN homepage...');
    const response = await fetch(`${NNVN_BASE_URL}/nong-nghiep/`);
    const html = await response.text();
    
    console.log('✅ Got HTML, parsing...');
    const articles = parseHomepageHTML(html);
    
    console.log(`📰 Scraped ${articles.length} real articles!`);
    return articles;
  } catch (error) {
    console.error('Error scraping homepage:', error);
    return [];
  }
};

// Scrape với proxy để tránh CORS (fallback)
const scrapeWithFallback = async (url) => {
  try {
    // Thử scrape trực tiếp trước
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      return await response.text();
    }
    
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('Direct fetch failed, using fallback data:', error.message);
    return null; // Sẽ dùng sample data
  }
};

// Cải thiện scrape homepage
export const scrapeNNVNHomepageImproved = async () => {
  try {
    const html = await scrapeWithFallback(`${NNVN_BASE_URL}/nong-nghiep/`);
    
    if (!html) {
      return [];
    }
    
    const articles = parseHomepageHTML(html);
    return articles;
  } catch (error) {
    console.error('Error in improved scraper:', error);
    return [];
  }
};



// Scrape tin từ danh mục cụ thể
export const scrapeNNVNCategory = async (categorySlug) => {
  try {
    console.log(`🔍 Scraping category: ${categorySlug}`);
    const url = `${NNVN_BASE_URL}/${categorySlug}/`;
    const response = await fetch(url);
    const html = await response.text();
    
    const articles = parseHomepageHTML(html, CATEGORIES[categorySlug] || 'Nông nghiệp');
    console.log(`✅ Scraped ${articles.length} articles from ${categorySlug}`);
    return articles;
  } catch (error) {
    console.error(`Error scraping category ${categorySlug}:`, error);
    return [];
  }
};

// Parse HTML để lấy tin tức (cải thiện)
const parseHomepageHTML = (html, defaultCategory = 'Nông nghiệp') => {
  const articles = [];
  
  try {
    console.log('🔍 Parsing HTML content...');
    
    // Tìm bài viết chính (box-home-main-item)
    const mainArticleRegex = /<div class="box-home-main-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/;
    const mainArticleMatch = html.match(mainArticleRegex);
    if (mainArticleMatch) {
      const mainArticle = parseArticleBlock(mainArticleMatch[1], true);
      if (mainArticle) {
        articles.push({ ...mainArticle, featured: true });
        console.log('✅ Found main article:', mainArticle.title.substring(0, 50) + '...');
      }
    }

    // Tìm các bài viết phụ (box-home-right-item)
    const rightArticlesRegex = /<div class="box-home-right-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
    let match;
    let rightCount = 0;
    while ((match = rightArticlesRegex.exec(html)) !== null && rightCount < 5) {
      const article = parseArticleBlock(match[1], false);
      if (article) {
        articles.push({ ...article, featured: false });
        rightCount++;
      }
    }
    console.log(`✅ Found ${rightCount} right articles`);

    // Tìm tin trong danh sách (news-home-item)
    const newsItemsRegex = /<li class="news-home-item"[^>]*>([\s\S]*?)<\/li>/g;
    let newsCount = 0;
    while ((match = newsItemsRegex.exec(html)) !== null && newsCount < 10) {
      const article = parseNewsItem(match[1]);
      if (article) {
        articles.push({ ...article, featured: false });
        newsCount++;
      }
    }
    console.log(`✅ Found ${newsCount} news items`);
    
    console.log(`📊 Total parsed: ${articles.length} articles`);

  } catch (error) {
    console.error('Error parsing HTML:', error);
  }

  return articles.slice(0, 12); // Trả về 12 bài
};

// Parse một block bài viết (cải thiện)
const parseArticleBlock = (htmlBlock, isMain = false) => {
  try {
    // Lấy link và title (nhiều pattern)
    let linkMatch = htmlBlock.match(/<a[^>]*href="([^"]*)"[^>]*title="([^"]*)"[^>]*>/) ||
                   htmlBlock.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/) ||
                   htmlBlock.match(/<h[1-6][^>]*><a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a><\/h[1-6]>/);
    
    if (!linkMatch) return null;

    const [, url, title] = linkMatch;
    
    // Lấy ảnh (nhiều pattern)
    const imgMatch = htmlBlock.match(/<img[^>]*src="([^"]*)"[^>]*>/);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    // Lấy mô tả (main-intro)
    const introMatch = htmlBlock.match(/<p class="main-intro[^"]*"[^>]*>([\s\S]*?)<\/p>/);
    let content = '';
    if (introMatch) {
      content = cleanHTML(introMatch[1]);
    }

    // Lấy thời gian
    const timeMatch = htmlBlock.match(/<span class="news-push-date"[^>]*>\s*([^<]*)\s*<\/span>/);
    const publishTime = timeMatch ? parseVietnameseDate(timeMatch[1].trim()) : new Date();

    // Lấy danh mục
    const categoryMatch = htmlBlock.match(/<a href="[^"]*"[^>]*class="news-cate-link"[^>]*>([^<]*)<\/a>/);
    const category = categoryMatch ? categoryMatch[1].trim() : 'Nông nghiệp';

    return {
      title: cleanHTML(title),
      content: content || title, // Nếu không có mô tả thì dùng title
      url: url.startsWith('http') ? url : `${NNVN_BASE_URL}${url}`,
      imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${NNVN_BASE_URL}${imageUrl}`) : null,
      source: 'Khuyến nông',
      category: category,
      publishedAt: publishTime,
      scrapedAt: new Date()
    };
  } catch (error) {
    console.error('Error parsing article block:', error);
    return null;
  }
};

// Parse news item trong danh sách
const parseNewsItem = (htmlBlock) => {
  try {
    // Lấy link và title từ h3
    const titleMatch = htmlBlock.match(/<h3[^>]*><a href="([^"]*)"[^>]*title="([^"]*)"[^>]*>([^<]*)<\/a><\/h3>/);
    if (!titleMatch) return null;

    const [, url, titleAttr, titleText] = titleMatch;
    const title = titleAttr || titleText;

    // Lấy ảnh
    const imgMatch = htmlBlock.match(/<img[^>]*src="([^"]*)"[^>]*>/);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    // Lấy mô tả
    const introMatch = htmlBlock.match(/<p class="main-intro[^"]*"[^>]*>([\s\S]*?)<\/p>/);
    let content = '';
    if (introMatch) {
      content = cleanHTML(introMatch[1]);
    }

    // Lấy thời gian
    const timeMatch = htmlBlock.match(/<span class="news-push-date"[^>]*>\s*([^<]*)\s*<\/span>/);
    const publishTime = timeMatch ? parseVietnameseDate(timeMatch[1].trim()) : new Date();

    // Lấy danh mục
    const categoryMatch = htmlBlock.match(/<a href="[^"]*"[^>]*class="news-cate-link"[^>]*>([^<]*)<\/a>/);
    const category = categoryMatch ? categoryMatch[1].trim() : 'Nông nghiệp';

    return {
      title: cleanHTML(title),
      content: content || title,
      url: url.startsWith('http') ? url : `${NNVN_BASE_URL}${url}`,
      imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${NNVN_BASE_URL}${imageUrl}`) : null,
      source: 'Khuyến nông',
      category: category,
      publishedAt: publishTime,
      scrapedAt: new Date()
    };
  } catch (error) {
    console.error('Error parsing news item:', error);
    return null;
  }
};

// Làm sạch HTML tags
const cleanHTML = (html) => {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Xóa HTML tags
    .replace(/&nbsp;/g, ' ') // Thay &nbsp; bằng space
    .replace(/&amp;/g, '&') // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Gộp nhiều space thành 1
    .trim();
};

// Parse thời gian tiếng Việt (dd/mm/yyyy - hh:mm)
const parseVietnameseDate = (dateStr) => {
  try {
    // Format: "12/12/2025 - 12:24"
    const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-\s*(\d{1,2}):(\d{2})/);
    if (match) {
      const [, day, month, year, hour, minute] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    }
    
    // Nếu không parse được thì trả về thời gian hiện tại
    return new Date();
  } catch (error) {
    return new Date();
  }
};

// Scrape tất cả danh mục
export const scrapeAllNNVNCategories = async () => {
  const allArticles = [];
  
  for (const [slug, name] of Object.entries(CATEGORIES)) {
    try {
      console.log(`Scraping category: ${name}`);
      const articles = await scrapeNNVNCategory(slug);
      allArticles.push(...articles);
      
      // Delay để tránh spam server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error scraping category ${name}:`, error);
    }
  }
  
  // Loại bỏ trùng lặp dựa trên URL
  const uniqueArticles = allArticles.filter((article, index, self) => 
    index === self.findIndex(a => a.url === article.url)
  );
  
  // Sắp xếp theo thời gian mới nhất
  return uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
};



export { CATEGORIES };