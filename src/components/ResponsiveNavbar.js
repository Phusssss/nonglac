import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PWAInstallButton from './PWAInstallButton';
import logo from '../assets/images/logo.demo.nontext.png';

const ResponsiveNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileAiMenu, setShowMobileAiMenu] = useState(false);

  // Handle search functionality
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate('/');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Load Material Icons and Inter font
  useEffect(() => {
    // Material Icons
    if (!document.querySelector('link[href*="material-icons"]')) {
      const materialLink = document.createElement('link');
      materialLink.rel = 'stylesheet';
      materialLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Round';
      document.head.appendChild(materialLink);
    }

    // Inter font
    if (!document.querySelector('link[href*="Inter"]')) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(fontLink);
    }

    // Tailwind config and custom styles
    if (!document.querySelector('#custom-styles')) {
      const style = document.createElement('style');
      style.id = 'custom-styles';
      style.textContent = `
        body {
          font-family: 'Inter', sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Lỗi đăng xuất: ' + error.message);
    }
  }, [logout, navigate]);

  const aiMenuItems = useMemo(() => [
    { text: 'ChatBot AI', action: 'chatbot', icon: 'chat', color: 'bg-blue-500' },
    { text: 'Bác sĩ cây trồng', path: '/plant-doctor', icon: 'medical_services', color: 'bg-green-500' },
    { text: 'Thị trường', path: '/market-insights', icon: 'trending_up', color: 'bg-orange-500' },
    { text: 'Bản đồ nông vụ', path: '/agri-map', icon: 'map', color: 'bg-purple-500' },
  ], []);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="NôngLạc Logo" className="h-8 w-auto" />
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons-round text-gray-400 group-focus-within:text-[#4CAF50] transition-colors text-lg">search</span>
                </div>
                <input 
                  className="block w-full pl-9 pr-10 py-1.5 border border-gray-200 rounded-full leading-5 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition duration-150 ease-in-out shadow-sm" 
                  placeholder="Tìm kiếm nông dân, sản phẩm, tin tức..." 
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearch}
                />
                {searchQuery && (
                  <button
                    onClick={handleSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4CAF50] hover:text-[#388E3C] transition-colors"
                  >
                    <span className="material-icons-round text-lg">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center space-x-4 text-xs font-medium text-gray-600">
              <button 
                onClick={() => navigate('/')}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  location.pathname === '/' ? 'text-[#4CAF50]' : 'hover:text-[#4CAF50]'
                }`}
              >
                <span className="material-icons-round text-lg">home</span>
                <span>Trang chủ</span>
              </button>
              
              <button 
                onClick={() => navigate('/missions')}
                className="flex flex-col items-center gap-0.5 hover:text-[#4CAF50] transition-colors group"
              >
                <span className="material-icons-round text-lg group-hover:scale-110 transition-transform">emoji_events</span>
                <span>Nhiệm vụ</span>
              </button>
              
              {/* AI Tools Dropdown */}
              <div className="relative group cursor-pointer flex flex-col items-center gap-0.5 hover:text-[#4CAF50] transition-colors">
                <span className="material-icons-round text-lg group-hover:scale-110 transition-transform">smart_toy</span>
                <div className="flex items-center">
                  AI 
                  <span className="material-icons-round text-xs ml-0.5">expand_more</span>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
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
                      <span className="material-icons-round text-lg">{item.icon}</span>
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/marketplace')}
                className="flex flex-col items-center gap-0.5 hover:text-[#4CAF50] transition-colors group"
              >
                <span className="material-icons-round text-lg group-hover:scale-110 transition-transform">storefront</span>
                <span>Chợ</span>
              </button>
              
              <button 
                onClick={() => user ? navigate('/profile') : navigate('/phone-login')}
                className="flex flex-col items-center gap-0.5 hover:text-[#4CAF50] transition-colors group"
              >
                <span className="material-icons-round text-lg group-hover:scale-110 transition-transform">person</span>
                <span>Profile</span>
              </button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {/* Messages - chỉ hiện khi đã đăng nhập */}
              {user && (
                <button 
                  onClick={() => navigate('/messages')}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-[#4CAF50] transition-colors"
                >
                  <span className="material-icons-round text-lg">chat</span>
                </button>
              )}
              
              {/* PWA Install Button */}
              <PWAInstallButton />
              
              {user ? (
                <>
                  {/* User Avatar & Info */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 bg-[#4CAF50] rounded-full flex items-center justify-center cursor-pointer text-white font-medium text-sm"
                      onClick={() => navigate('/profile')}
                    >
                      {userProfile?.displayName?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs text-gray-600 hidden xl:block">
                      Uy tín: {userProfile?.reputation || 0}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-500 transition-colors text-xs font-medium"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/phone-register')}
                    className="hidden sm:block text-gray-700 hover:text-[#4CAF50] font-medium text-xs transition-colors"
                  >
                    Đăng ký
                  </button>
                  
                  <button 
                    onClick={() => navigate('/phone-login')}
                    className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50 transform hover:-translate-y-0.5"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 text-gray-600">
        <div className="flex justify-center items-end px-4 py-3 relative">
          {/* Left side - 2 items */}
          <div className="flex-1 flex justify-around">
            <button 
              onClick={() => navigate('/')}
              className={`flex flex-col items-center ${location.pathname === '/' ? 'text-[#4CAF50]' : ''}`}
            >
              <span className="material-icons-round">home</span>
              <span className="text-[10px]">Trang chủ</span>
            </button>
            
            <button 
              onClick={() => navigate('/missions')}
              className="flex flex-col items-center"
            >
              <span className="material-icons-round">emoji_events</span>
              <span className="text-[10px]">Nhiệm vụ</span>
            </button>
          </div>
          
          {/* Center AI Button */}
          <div className="relative mx-4">
            <button 
              onClick={() => setShowMobileAiMenu(!showMobileAiMenu)}
              className="relative -top-6 bg-[#4CAF50] p-4 rounded-full text-white shadow-lg shadow-green-500/40 flex items-center justify-center"
            >
              <span className="material-icons-round text-2xl">smart_toy</span>
            </button>
            
            {/* Mobile AI Dropdown */}
            {showMobileAiMenu && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                {aiMenuItems.map((item, index) => (
                  <button
                    key={`mobile-ai-${index}-${item.path || item.action}`}
                    onClick={() => {
                      if (item.action === 'chatbot') {
                        window.dispatchEvent(new CustomEvent('openChatBot'));
                      } else {
                        navigate(item.path);
                      }
                      setShowMobileAiMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center gap-3 text-sm text-gray-700 hover:text-[#4CAF50] first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span className="material-icons-round text-lg">{item.icon}</span>
                    {item.text}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Right side - 2 items */}
          <div className="flex-1 flex justify-around">
            <button 
              onClick={() => navigate('/marketplace')}
              className="flex flex-col items-center"
            >
              <span className="material-icons-round">storefront</span>
              <span className="text-[10px]">Chợ</span>
            </button>
            
            <button 
              onClick={() => user ? navigate('/profile') : navigate('/phone-login')}
              className="flex flex-col items-center"
            >
              <span className="material-icons-round">person</span>
              <span className="text-[10px]">Profile</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile AI Menu Backdrop */}
      {showMobileAiMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setShowMobileAiMenu(false)}
        />
      )}
    </>
  );
};

export default React.memo(ResponsiveNavbar);