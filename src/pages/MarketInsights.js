import React, { useState } from 'react';
import { getMarketInsights, getWeatherForecast, formatAIResponse } from '../services/geminiService';
import { TrendingUp, TrendingDown, Search, Cloud, MapPin } from 'lucide-react';
import AIQuotaIndicator from '../components/AIQuotaIndicator';

const MarketInsights = () => {
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState('');
  const [weather, setWeather] = useState('');
  const [location, setLocation] = useState('Việt Nam');
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const popularProducts = [
    { name: 'Cà phê', icon: '☕' },
    { name: 'Lúa gạo', icon: '🌾' },
    { name: 'Hồ tiêu', icon: '🌶️' },
    { name: 'Cao su', icon: '🌳' },
    { name: 'Điều', icon: '🥜' },
    { name: 'Tôm', icon: '🦐' }
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await getMarketInsights(query);
      setInsights(result);
    } catch (error) {
      console.error('Error fetching insights:', error);
      if (error.message?.includes('Đã hết lượt sử dụng')) {
        setInsights('😔 Bạn đã hết lượt sử dụng thị trường hôm nay!\n\n🚀 Nâng cấp gói để có thêm lượt hoặc chờ đến ngày mai.');
      } else {
        setInsights('Không thể lấy thông tin thị trường. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (product) => {
    setQuery(product);
    setLoading(true);
    getMarketInsights(product)
      .then(result => setInsights(result))
      .catch(error => {
        if (error.message?.includes('Đã hết lượt sử dụng')) {
          setInsights('😔 Bạn đã hết lượt sử dụng thị trường hôm nay!\n\n🚀 Nâng cấp gói để có thêm lượt hoặc chờ đến ngày mai.');
        } else {
          setInsights('Không thể lấy thông tin thị trường.');
        }
      })
      .finally(() => setLoading(false));
  };

  const handleWeatherSearch = async () => {
    setWeatherLoading(true);
    try {
      const result = await getWeatherForecast(location);
      setWeather(result);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather('Không thể lấy thông tin thời tiết.');
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            Thị Trường Nông Sản
          </h1>
          <div className="flex items-center gap-4 mt-2 ml-16">
            <p className="text-gray-600">
              Thông tin giá cả và xu hướng thị trường nông sản cập nhật từ AI
            </p>
            <AIQuotaIndicator actionType="marketInsights" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Search */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                Tìm kiếm thông tin thị trường
              </h3>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nhập tên nông sản (VD: giá cà phê hôm nay)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tìm...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Tìm kiếm
                    </>
                  )}
                </button>
              </div>

              {/* Quick Search */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Tìm kiếm nhanh:</p>
                <div className="flex flex-wrap gap-2">
                  {popularProducts.map((product) => (
                    <button
                      key={product.name}
                      onClick={() => handleQuickSearch(product.name)}
                      className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <span>{product.icon}</span>
                      {product.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[400px]">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100 rounded-t-2xl">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Phân tích thị trường
                </h3>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      <TrendingUp className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-500 font-medium">Đang phân tích dữ liệu thị trường...</p>
                  </div>
                ) : insights ? (
                  <div className="prose prose-lg prose-green max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: formatAIResponse(insights) }} />
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm text-yellow-800 flex items-start gap-2">
                        <span className="text-lg">⚠️</span>
                        <span>Thông tin chỉ mang tính tham khảo. Vui lòng kiểm tra thêm từ các nguồn chính thức.</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <TrendingUp className="w-20 h-20 mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">Chưa có dữ liệu</p>
                    <p className="text-sm text-gray-400 mt-1">Nhập tên nông sản để xem phân tích</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Weather */}
          <div className="space-y-6">
            
            {/* Weather Widget */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                Thời tiết & Lời khuyên
              </h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleWeatherSearch()}
                    placeholder="Nhập địa điểm"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                
                <button
                  onClick={handleWeatherSearch}
                  disabled={weatherLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {weatherLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-5 h-5" />
                      Xem thời tiết
                    </>
                  )}
                </button>
              </div>

              {weather && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {weather}
                  </p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Mẹo sử dụng
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Tìm kiếm cụ thể: "giá cà phê Đắk Lắk hôm nay"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Hỏi xu hướng: "xu hướng giá lúa tháng này"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>So sánh: "so sánh giá tôm miền Tây"</span>
                </li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Xu hướng tìm kiếm</h3>
              <div className="space-y-3">
                {[
                  { name: 'Cà phê', trend: 'up', percent: '+5%' },
                  { name: 'Lúa gạo', trend: 'down', percent: '-2%' },
                  { name: 'Hồ tiêu', trend: 'up', percent: '+8%' }
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-bold ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.percent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;
