import React, { useState, useEffect } from 'react';
import { 
  scrapeNNVNNews, 
  scrapeAllNNVNNews, 
  NNVN_CATEGORIES 
} from '../services/crawlerService';

const NNVNNewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState(null);

  // Load tin tức khi component mount
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async (category = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let articles;
      if (category === 'all') {
        articles = await scrapeAllNNVNNews();
      } else {
        articles = await scrapeNNVNNews(category, 15);
      }
      
      setNews(articles);
    } catch (err) {
      setError('Không thể tải tin tức. Vui lòng thử lại sau.');
      console.error('Error loading news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    loadNews(category || null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="nnvn-news-feed">
      <div className="news-header">
        <h2>📰 Tin tức từ Báo Nông Nghiệp Việt Nam</h2>
        
        {/* Bộ lọc danh mục */}
        <div className="category-filter">
          <select 
            value={selectedCategory} 
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="category-select"
          >
            <option value="">Trang chủ Nông nghiệp</option>
            {Object.entries(NNVN_CATEGORIES).map(([slug, name]) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
            <option value="all">Tất cả danh mục</option>
          </select>
          
          <button 
            onClick={() => loadNews(selectedCategory || null)}
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? '🔄' : '↻'} Làm mới
          </button>
        </div>
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading">
          <div className="loading-spinner">🔄</div>
          <p>Đang tải tin tức...</p>
        </div>
      )}

      {/* Danh sách tin tức */}
      <div className="news-list">
        {news.length === 0 && !loading && (
          <div className="no-news">
            📭 Không có tin tức nào
          </div>
        )}

        {news.map((article, index) => (
          <div key={index} className={`news-item ${article.featured ? 'featured' : ''}`}>
            {article.imageUrl && (
              <div className="news-image">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="news-content">
              <div className="news-meta">
                <span className="category">{article.category}</span>
                <span className="source">{article.source}</span>
                <span className="date">{formatDate(article.publishedAt)}</span>
              </div>
              
              <h3 className="news-title">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {article.title}
                </a>
              </h3>
              
              <p className="news-summary">{article.content}</p>
              
              <div className="news-actions">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="read-more"
                >
                  Đọc tiếp →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .nnvn-news-feed {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .news-header {
          margin-bottom: 30px;
        }

        .news-header h2 {
          color: #2c5530;
          margin-bottom: 15px;
        }

        .category-filter {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .category-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background: white;
          min-width: 200px;
        }

        .refresh-btn {
          padding: 8px 15px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #45a049;
        }

        .refresh-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          border-left: 4px solid #c62828;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .loading-spinner {
          font-size: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .no-news {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }

        .news-item {
          display: flex;
          gap: 15px;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 15px;
          background: white;
          transition: box-shadow 0.3s;
        }

        .news-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .news-item.featured {
          border-left: 4px solid #4CAF50;
          background: #f8fff8;
        }

        .news-image {
          flex-shrink: 0;
          width: 120px;
        }

        .news-image img {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 5px;
        }

        .news-content {
          flex: 1;
        }

        .news-meta {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #666;
        }

        .category {
          background: #e8f5e8;
          color: #2c5530;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 500;
        }

        .news-title {
          margin: 0 0 10px 0;
          font-size: 16px;
          line-height: 1.4;
        }

        .news-title a {
          color: #333;
          text-decoration: none;
        }

        .news-title a:hover {
          color: #4CAF50;
        }

        .news-summary {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .read-more {
          color: #4CAF50;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .read-more:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .nnvn-news-feed {
            padding: 15px;
          }

          .news-item {
            flex-direction: column;
          }

          .news-image {
            width: 100%;
          }

          .news-image img {
            height: 150px;
          }

          .category-filter {
            flex-direction: column;
            align-items: stretch;
          }

          .category-select {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default NNVNNewsFeed;