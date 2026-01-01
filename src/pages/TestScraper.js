import React, { useState } from 'react';
import { scrapeNNVNNews, NNVN_CATEGORIES } from '../services/crawlerService';
import AutoPostManager from '../components/AutoPostManager';
import ScheduleManager from '../components/ScheduleManager';

const TestScraper = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testScraper = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing NNVN Scraper...');
      const articles = await scrapeNNVNNews(null, 12); // Lấy 12 bài
      console.log('✅ Scraped articles:', articles);
      setNews(articles);
    } catch (err) {
      console.error('❌ Scraper failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Test NNVN Scraper</h2>
      
      <button 
        onClick={testScraper}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Đang test...' : 'Test Scraper'}
      </button>

      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '5px',
          margin: '20px 0',
          border: '1px solid #c62828'
        }}>
          ❌ Lỗi: {error}
        </div>
      )}



      {news.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📰 Kết quả ({news.length} bài với hình ảnh):</h3>
          {news.map((article, index) => (
            <div key={index} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              margin: '10px 0',
              background: '#f9f9f9',
              display: 'flex',
              gap: '15px'
            }}>
              {article.imageUrl && (
                <div style={{ flexShrink: 0, width: '120px' }}>
                  <img 
                    src={article.imageUrl}
                    alt={article.title}
                    style={{
                      width: '100%',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '5px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  {article.title}
                </h4>
                <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                  📂 {article.category} | 🏢 {article.source}
                </p>
                <p style={{ color: '#555', lineHeight: '1.5' }}>
                  {article.content}
                </p>
                {article.url && (
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#4CAF50', textDecoration: 'none' }}
                  >
                    Đọc tiếp →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
        <h4>📋 Danh mục hỗ trợ:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(NNVN_CATEGORIES).map(([slug, name]) => (
            <div key={slug} style={{ padding: '5px', background: 'white', borderRadius: '3px' }}>
              <code>{slug}</code> → {name}
            </div>
          ))}
        </div>
      </div>

      {/* Auto Post Manager */}
      <AutoPostManager />

      {/* Schedule Manager */}
      <ScheduleManager />

    </div>
  );
};

export default TestScraper;