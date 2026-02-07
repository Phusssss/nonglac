import { useState } from 'react';
import { Button } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { analyzePlantImage } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useErrorHandler } from '../utils/errorHandler';
import AIQuotaIndicator from '../components/AIQuotaIndicator';
import EnhancedLoginModal from '../components/enhanced/EnhancedLoginModal';

const PlantDoctor = () => {
  const { user } = useAuth();
  const { requireAuthForAI, showLoginModal, setShowLoginModal } = useAuthGuard();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const { handleAsyncError } = useErrorHandler();

  const handleVideoCall = () => {
    navigate('/ai-video-call');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    return requireAuthForAI(async () => {
      setLoading(true);
      setAnalysis('');
      
      try {
        const userPrompt = prompt || "Hãy chẩn đoán bệnh cho cây này và đề xuất cách điều trị.";
        
        // Convert file to base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        const result = await analyzePlantImage(base64, userPrompt);
        
        // Kiểm tra nếu service trả về null (user chưa đăng nhập)
        if (result === null) {
          // Service đã xử lý auth guard, không cần làm gì thêm
          setLoading(false);
          return;
        }

        if (result) {
          setAnalysis(result);
        }
      } catch (error) {
        handleAsyncError(async () => {
          throw error;
        }, {
          component: 'PlantDoctor',
          action: 'analyze'
        });
      }
      
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-agri-800 flex items-center gap-2 md:gap-3">
            <div className="bg-agri-100 p-1.5 md:p-2 rounded-lg">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-agri-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Bác Sĩ Cây Trồng AI
          </h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mt-3 md:mt-2 md:ml-14">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="text-sm md:text-base text-gray-600">
                Chẩn đoán bệnh cây trồng chính xác trong vài giây nhờ công nghệ Gemini Vision.
              </p>
              <AIQuotaIndicator actionType="doctorAI" />
            </div>
            {user && (
              <Button
                type="primary"
                size="large"
                icon={<VideoCameraOutlined />}
                onClick={handleVideoCall}
                className="flex-shrink-0 w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Gọi Video với Lạc Lạc</span>
                <span className="sm:hidden">Gọi Video AI</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Input Area */}
          <div className="w-full lg:w-5/12 space-y-5">
            <div className={`relative border-2 border-dashed rounded-2xl p-1 transition-all duration-300 ${selectedImage ? 'border-agri-500 bg-agri-50' : 'border-gray-300 hover:border-agri-400 bg-white hover:bg-gray-50'}`}>
              <div className="relative rounded-xl overflow-hidden min-h-[320px] flex flex-col items-center justify-center bg-white">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={loading}
                />
                
                {!selectedImage ? (
                  <div className="text-center p-6">
                    <div className="w-20 h-20 bg-agri-100 text-agri-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-700">Chạm để chụp hoặc tải ảnh lên</p>
                    <p className="text-sm text-gray-500 mt-2">Hỗ trợ JPG, PNG. Nên chụp rõ lá hoặc thân bị bệnh.</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full group">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-contain max-h-[400px]" />
                    {loading && (
                      <div className="absolute inset-0 z-10 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-agri-400 shadow-[0_0_20px_rgba(74,222,128,0.8)] animate-scan"></div>
                        <div className="absolute inset-0 bg-agri-900/10 backdrop-blur-[1px]"></div>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <span className="inline-flex items-center gap-2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            AI đang phân tích...
                          </span>
                        </div>
                      </div>
                    )}
                    {!loading && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">Thay đổi ảnh</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedImage && (
              <div className={`space-y-4 transition-all duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <input
                  type="text"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-agri-500 focus:ring-1 focus:ring-agri-500 text-sm shadow-sm"
                  placeholder="Ghi chú thêm (ví dụ: Cây bị vàng lá 2 ngày nay...)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-agri-600 to-agri-500 hover:from-agri-700 hover:to-agri-600 transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 text-lg disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Chẩn Đoán Ngay
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col overflow-hidden relative min-h-[400px]">
              
              <div className="bg-agri-50 px-6 py-4 border-b border-agri-100 flex items-center justify-between">
                <h3 className="font-bold text-agri-800 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Bệnh Án Điện Tử
                </h3>
                <span className="text-xs font-semibold px-2 py-1 bg-white text-agri-600 rounded border border-agri-200">
                  {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                {loading ? (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-6 animate-pulse">
                    <div className="w-16 h-16 bg-agri-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-agri-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="space-y-3 w-full max-w-md">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
                      <div className="h-20 bg-gray-50 rounded w-full mt-6"></div>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Đang kết nối với cơ sở dữ liệu bệnh học...</p>
                  </div>
                ) : analysis ? (
                  <div className="animate-fade-in-up">
                    <div className="prose prose-sm md:prose-base max-w-none text-gray-800">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {analysis}
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-start">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-bold text-blue-800 text-sm">Lưu ý quan trọng</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Kết quả chỉ mang tính tham khảo. Nếu bệnh diễn biến phức tạp, vui lòng liên hệ kỹ sư nông nghiệp địa phương.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-24 h-24 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p className="text-center text-lg font-medium text-gray-500">Chưa có dữ liệu phân tích</p>
                    <p className="text-center text-sm text-gray-400 mt-1">Vui lòng tải ảnh lên và nhấn "Chẩn Đoán"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Enhanced Login Modal */}
      <EnhancedLoginModal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        title="Đăng nhập để sử dụng Bác sĩ cây trồng"
        message="Đăng nhập để sử dụng AI chẩn đoán bệnh cây trồng"
        feature="sử dụng công cụ chẩn đoán AI"
      />

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default PlantDoctor;
