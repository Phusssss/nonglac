import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { Home, Users, ShoppingBag, MessageCircle, Newspaper, Bookmark, TrendingUp, Stethoscope, MapPin, BarChart3, Trophy } from 'lucide-react';

import logo from '../assets/images/logo.demo.nontext.png';

const ResponsiveNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiMenu, setShowAiMenu] = useState(false);

  // Load Material Icons
  useEffect(() => {
    if (!document.querySelector('link[href*="material-symbols"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      document.head.appendChild(link);
    }

    // Add glassmorphism CSS
    if (!document.querySelector('#glassmorphism-styles')) {
      const style = document.createElement('style');
      style.id = 'glassmorphism-styles';
      style.textContent = `
        .glass-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .material-symbols-rounded {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-rounded.font-variation-fill {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .slide-in-from-bottom-4 {
          animation-name: slideInFromBottom;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromBottom {
          from { transform: translateY(1rem) translateX(-50%); opacity: 0; }
          to { transform: translateY(0) translateX(-50%); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
      setDrawerOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      alert('Lỗi đăng xuất: ' + error.message);
    }
  }, [logout, navigate]);

  const menuItems = useMemo(() => [
    { text: 'Trang chủ', path: '/', icon: Home },
    { text: 'Nhiệm vụ', path: '/missions', icon: Trophy },
    { text: 'Giá nông sản', path: '/gia-nong-san', icon: TrendingUp },
    { text: 'Chợ', path: '/marketplace', icon: ShoppingBag },
    { text: 'Bài viết đã lưu', path: '/saved', icon: Bookmark },
  ], []);

  const aiMenuItems = useMemo(() => [
    { text: 'ChatBot AI', action: 'chatbot', icon: 'chat', color: 'bg-blue-500' },
    { text: 'Bác sĩ cây trồng', path: '/plant-doctor', icon: 'medical_services', color: 'bg-green-500' },
    { text: 'Thị trường', path: '/market-insights', icon: 'trending_up', color: 'bg-orange-500' },
    { text: 'Bản đồ nông vụ', path: '/agri-map', icon: 'map', color: 'bg-purple-500' },
  ], []);

  const handleMenuClick = useCallback((path) => {
    navigate(path);
    setDrawerOpen(false);
  }, [navigate]);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile icons */}
            <div className="md:hidden flex items-center space-x-2">
              {user && <NotificationBell />}
            </div>

            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="NôngLạc Logo" className="h-10 w-auto" />
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm nông dân, sản phẩm hoặc chủ đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`${
                    window.location.pathname === item.path
                      ? 'text-[#4CAF50] font-medium'
                      : 'text-gray-600 hover:text-[#4CAF50]'
                  } transition-colors text-sm`}
                >
                  {item.text}
                </button>
              ))}
              
              {/* AI Tools Dropdown */}
              <div className="relative group">
                <button className="text-gray-600 hover:text-[#4CAF50] transition-colors text-sm font-medium flex items-center gap-1">
                  🤖 AI Tools
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {aiMenuItems.map((item, index) => (
                    <button
                      key={`desktop-ai-${index}-${item.path || item.action}`}
                      onClick={() => {
                        if (item.action === 'chatbot') {
                          window.dispatchEvent(new CustomEvent('openChatBot'));
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center gap-3 text-sm text-gray-700 hover:text-[#4CAF50]"
                    >
                      <span className="material-symbols-rounded text-lg">{item.icon}</span>
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Terms of Service Link */}
              <button
                onClick={() => navigate('/terms-of-service')}
                className={`${
                  window.location.pathname === '/terms-of-service'
                    ? 'text-[#4CAF50] font-medium'
                    : 'text-gray-600 hover:text-[#4CAF50]'
                } transition-colors text-sm`}
              >
                Điều khoản
              </button>
              
              {/* About Us Link */}
              <button
                onClick={() => navigate('/about-us')}
                className={`${
                  window.location.pathname === '/about-us'
                    ? 'text-[#4CAF50] font-medium'
                    : 'text-gray-600 hover:text-[#4CAF50]'
                } transition-colors text-sm`}
              >
                Về chúng tôi
              </button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <NotificationBell />

                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/profile')}>
                      <span className="text-white text-sm font-medium">
                        {userProfile?.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 hidden lg:block">
                      Uy tín: {userProfile?.reputation || 0}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/phone-register')}
                    className="text-[#4CAF50] hover:text-[#45a049] transition-colors px-3 py-2"
                  >
                    Đăng ký
                  </button>
                  <button
                    onClick={() => navigate('/phone-login')}
                    className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#45a049] transition-colors"
                  >
                    Đăng nhập
                  </button>
                </div>
              )}
            </div>


          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Glassmorphism Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/75 backdrop-blur-xl border-t border-white/50 z-50 pb-safe shadow-[0_-5px_30px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center py-3">
          <button 
            onClick={() => navigate('/')} 
            className={`glass-btn rounded-2xl p-1 flex flex-col items-center w-14 border-none shadow-none bg-transparent group transition-transform ${
              location.pathname === '/' ? 'text-[#4CAF50] scale-110' : 'text-gray-400 opacity-60'
            }`}
          >
            <span className={`material-symbols-rounded text-[28px] mb-0.5 group-hover:scale-110 transition-transform ${
              location.pathname === '/' ? 'font-variation-fill' : ''
            }`}>home</span>
          </button>
          
          <button 
            onClick={() => navigate('/missions')} 
            className={`glass-btn rounded-2xl p-1 flex flex-col items-center w-14 border-none shadow-none bg-transparent group transition-transform ${
              location.pathname === '/missions' ? 'text-[#4CAF50] scale-110' : 'text-gray-400 opacity-60'
            }`}
          >
            <span className={`material-symbols-rounded text-[28px] mb-0.5 group-hover:scale-110 transition-transform ${
              location.pathname === '/missions' ? 'font-variation-fill' : ''
            }`}>military_tech</span>
          </button>
          
          {/* Center AI Button with Popup Menu */}
          <div className="relative -top-8">
            <button 
              onClick={() => setShowAiMenu(!showAiMenu)} 
              className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-full shadow-2xl shadow-green-600/30 flex items-center justify-center text-white border-[4px] border-white/40 hover:scale-110 transition-transform active:scale-95 group"
            >
              <span className="material-symbols-rounded text-3xl group-hover:rotate-12 transition-transform">smart_toy</span>
            </button>
            
            {/* AI Menu Popup */}
            {showAiMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowAiMenu(false)}
                />
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
                  <div className="grid grid-cols-2 gap-3 w-64">
                    {aiMenuItems.map((item, index) => (
                      <button
                        key={`ai-menu-${index}-${item.path || item.action}`}
                        onClick={() => {
                          if (item.action === 'chatbot') {
                            window.dispatchEvent(new CustomEvent('openChatBot'));
                          } else {
                            navigate(item.path);
                          }
                          setShowAiMenu(false);
                        }}
                        className="flex flex-col items-center p-3 rounded-xl hover:bg-white/50 transition-all group"
                      >
                        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform shadow-lg`}>
                          <span className="material-symbols-rounded text-xl">{item.icon}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center leading-tight">{item.text}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Arrow pointing down */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/90 rotate-45 border-r border-b border-white/50"></div>
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/marketplace')} 
            className={`glass-btn rounded-2xl p-1 flex flex-col items-center w-14 border-none shadow-none bg-transparent group transition-transform ${
              location.pathname === '/marketplace' ? 'text-[#4CAF50] scale-110' : 'text-gray-400 opacity-60'
            }`}
          >
            <span className={`material-symbols-rounded text-[28px] mb-0.5 group-hover:scale-110 transition-transform ${
              location.pathname === '/marketplace' ? 'font-variation-fill' : ''
            }`}>storefront</span>
          </button>
          
          <button 
            onClick={() => user ? navigate('/profile') : navigate('/phone-login')} 
            className={`glass-btn rounded-2xl p-1 flex flex-col items-center w-14 border-none shadow-none bg-transparent group transition-transform ${
              location.pathname === '/profile' ? 'text-[#4CAF50] scale-110' : 'text-gray-400 opacity-60'
            }`}
          >
            {user ? (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                location.pathname === '/profile' ? 'bg-[#4CAF50]' : 'bg-gray-400'
              }`}>
                <span className="text-white text-xs font-medium">
                  {userProfile?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
            ) : (
              <span className={`material-symbols-rounded text-[28px] mb-0.5 group-hover:scale-110 transition-transform ${
                location.pathname === '/profile' ? 'font-variation-fill' : ''
              }`}>person</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(ResponsiveNavbar);