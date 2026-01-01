import React, { useState } from 'react';
import { Activity, Key, AlertCircle } from 'lucide-react';

const ApiUsage = () => {
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_GEMINI_API_KEY || '');
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkUsage = async () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API key');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!response.ok) {
        throw new Error('API key không hợp lệ hoặc đã hết hạn');
      }

      const data = await response.json();
      
      setUsage({
        valid: true,
        models: data.models || [],
        timestamp: new Date().toLocaleString('vi-VN')
      });
    } catch (err) {
      setError(err.message);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            Kiểm Tra API Usage
          </h1>
          <p className="text-gray-600 mt-2 ml-16">
            Kiểm tra trạng thái và quota của Gemini API key
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Key hiện tại từ .env: {process.env.REACT_APP_GEMINI_API_KEY ? '✓ Đã cấu hình' : '✗ Chưa cấu hình'}
            </p>
          </div>

          <button
            onClick={checkUsage}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang kiểm tra...
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                Kiểm tra ngay
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Lỗi</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {usage && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  API Key hợp lệ
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Models khả dụng</p>
                    <p className="text-2xl font-bold text-gray-800">{usage.models.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Kiểm tra lúc</p>
                    <p className="text-sm font-semibold text-gray-800">{usage.timestamp}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Danh sách Models ({Array.isArray(usage.models) ? usage.models.length : 0})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.isArray(usage.models) && usage.models.map((model, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-mono text-sm font-semibold text-gray-800">
                            {model.name?.replace('models/', '')}
                          </p>
                          {model.displayName && (
                            <p className="text-xs text-gray-600 mt-1">{model.displayName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {model.supportedGenerationMethods?.includes('generateContent') && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Text</span>
                          )}
                        </div>
                      </div>
                      {model.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{model.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Quota & Usage
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Free Tier Limits</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-semibold text-gray-800">gemini-2.5-pro</p>
                        <p className="text-xs text-gray-600">15 RPM | 300 RPD</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">gemini-2.5-flash</p>
                        <p className="text-xs text-gray-600">10 RPM | 20 RPD</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800 mb-2">⚠️ Lưu ý</p>
                    <p className="text-xs text-yellow-700">
                      Gemini API không cung cấp endpoint để check số request/token còn lại. 
                      Vui lòng xem tại dashboard bên dưới.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <a 
                      href="https://aistudio.google.com/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      🔑 Quản lý API Keys
                    </a>
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/rate-limits" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      📊 Xem Rate Limits
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Hướng dẫn</h4>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">1.</span>
                <span>Lấy API key tại: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">2.</span>
                <span>Paste key vào ô trên hoặc file <code className="bg-gray-100 px-1 rounded">.env</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">3.</span>
                <span>Nhấn "Kiểm tra ngay" để xác thực</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiUsage;
