import React, { useState, useEffect } from 'react';
import { findPlaces } from '../services/geminiService';
import { MapPin, Search, Navigation } from 'lucide-react';
import AIQuotaIndicator from '../components/AIQuotaIndicator';

const AgriMap = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ text: '', places: [] });
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [mapUrl, setMapUrl] = useState('https://maps.google.com/maps?q=nông nghiệp Việt Nam&t=&z=6&ie=UTF8&iwloc=&output=embed');

  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus('locating');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('success');
          setMapUrl(`https://maps.google.com/maps?q=vật tư nông nghiệp gần đây&ll=${pos.coords.latitude},${pos.coords.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
        },
        () => setLocationStatus('error')
      );
    }
  }, []);

  const suggestions = [
    { label: '📍 Cửa hàng phân bón', query: 'Cửa hàng phân bón thuốc bảo vệ thực vật' },
    { label: '🌾 Trạm thu mua lúa', query: 'Trạm thu mua lúa gạo nông sản' },
    { label: '🚜 Sửa chữa máy cày', query: 'Tiệm sửa chữa máy nông nghiệp' },
    { label: '🌱 Vườn ươm giống', query: 'Vườn ươm cây giống nông nghiệp' },
    { label: '🏪 HTX Nông nghiệp', query: 'Hợp tác xã nông nghiệp' }
  ];

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('success');
        handleSearch(undefined, 'Cửa hàng vật tư nông nghiệp gần đây');
      },
      () => setLocationStatus('error')
    );
  };

  const handleSearch = async (e, overrideQuery) => {
    if (e) e.preventDefault();
    const q = overrideQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setResults({ text: '', places: [] });

    let mapQuery = q;
    if (userLocation && (q.includes('gần đây') || q.includes('gần tôi'))) {
      mapQuery = `${q} loc:${userLocation.lat}+${userLocation.lng}`;
    }
    
    const encodedQuery = encodeURIComponent(mapQuery);
    setMapUrl(`https://maps.google.com/maps?q=${encodedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`);

    if (overrideQuery) setQuery(overrideQuery);
    
    try {
      const data = await findPlaces(q, userLocation?.lat, userLocation?.lng);
      
      // Kiểm tra nếu service trả về null (user chưa đăng nhập)
      if (data === null) {
        // Service đã xử lý auth guard, không cần làm gì thêm
        return;
      }
      
      setResults(data);
    } catch (error) {
      console.error('Error finding places:', error);
      if (error.message?.includes('Đã hết lượt sử dụng')) {
        setResults({ 
          text: '😔 Bạn đã hết lượt sử dụng bản đồ nông vụ hôm nay!\n\n🚀 Nâng cấp gói để có thêm lượt hoặc chờ đến ngày mai.', 
          places: [] 
        });
      } else {
        setResults({ text: 'Không thể tìm kiếm địa điểm. Vui lòng thử lại.', places: [] });
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 h-[calc(100vh-100px)] flex flex-col">
      
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex-shrink-0">
        <form onSubmit={(e) => handleSearch(e)} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm: Điểm thu mua, Cửa hàng vật tư..."
              className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <button 
            type="button"
            onClick={handleGetLocation}
            className={`px-4 py-2.5 rounded-lg border flex items-center gap-2 font-medium transition-colors whitespace-nowrap text-sm ${locationStatus === 'success' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300'}`}
          >
            {locationStatus === 'locating' ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {locationStatus === 'success' ? 'Đã định vị' : 'Gần tôi'}
          </button>

          <button 
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm text-sm"
          >
            Tìm Kiếm
          </button>
        </form>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((s, idx) => (
            <button 
              key={idx} 
              onClick={() => handleSearch(undefined, s.query)}
              className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 border border-emerald-100 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Split View Map + Results */}
      <div className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
        
        {/* LEFT: Interactive Map */}
        <div className="w-full lg:w-2/3 bg-gray-200 rounded-xl overflow-hidden shadow-inner border border-gray-300 relative min-h-[300px] lg:min-h-0">
          <iframe 
            width="100%" 
            height="100%" 
            style={{border:0}} 
            loading="lazy" 
            allowFullScreen 
            src={mapUrl}
            title="AgriMap"
          ></iframe>
        </div>

        {/* RIGHT: AI Insights & List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
          <div className="p-4 bg-emerald-50 border-b border-emerald-100">
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Thông tin từ AgriBot
            </h3>
            <AIQuotaIndicator actionType="agriMap" showLabel={false} />
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-32 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ) : results.text ? (
              <div className="space-y-4">
                <div className="prose prose-sm prose-green text-gray-700">
                  <p className="text-sm italic text-gray-500 mb-2 border-l-2 border-emerald-300 pl-2">
                    Dựa trên dữ liệu tìm kiếm, dưới đây là các địa điểm phù hợp nhất:
                  </p>
                  <div className="whitespace-pre-wrap">{results.text}</div>
                </div>

                {results.places.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Địa điểm đề xuất</h4>
                    {results.places.map((place, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                        <h5 className="font-bold text-gray-900 text-sm mb-1">{place.title}</h5>
                        <a 
                          href={place.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>📍</span> Chỉ đường Google Maps
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-10">
                <MapPin className="w-16 h-16 mx-auto mb-3 opacity-20" />
                <p>Chọn một danh mục hoặc nhập từ khóa để tìm kiếm địa điểm nông nghiệp.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgriMap;
