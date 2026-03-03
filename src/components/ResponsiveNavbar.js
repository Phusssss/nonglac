import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUnreadMessages } from '../features/messages/hooks';
import PWAInstallButton from './PWAInstallButton';
import logo from '../assets/images/logo.demo.nontext.png';
import { 
  SearchRounded, 
  ArrowForwardRounded, 
  HomeRounded, 
  EmojiEventsRounded, 
  PsychologyAltRounded, 
  ExpandMoreRounded, 
  StorefrontRounded, 
  PersonRounded, 
  ChatRounded,
  MedicalServicesRounded,
  TrendingUpRounded,
  MapRounded
} from '@mui/icons-material';

const ResponsiveNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();
  const { totalUnreadCount } = useUnreadMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileAiMenu, setShowMobileAiMenu] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

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

  // Custom styles cleanup
  useEffect(() => {
    // Tailwind config and custom styles
    if (!document.querySelector('#custom-styles')) {
      const style = document.createElement('style');
      style.id = 'custom-styles';
      style.textContent = `
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
    { text: 'ChatBot AI', action: 'chatbot', icon: <ChatRounded fontSize="small" />, color: 'bg-blue-500' },
    { text: 'Bác sĩ cây trồng', path: '/plant-doctor', icon: <MedicalServicesRounded fontSize="small" />, color: 'bg-green-500' },
    { text: 'Thị trường', path: '/market-insights', icon: <TrendingUpRounded fontSize="small" />, color: 'bg-orange-500' },
    { text: 'Giá nông sản', path: '/gia-ca-phe-hom-nay', icon: <TrendingUpRounded fontSize="small" />, color: 'bg-yellow-500' },
    { text: 'Bản đồ nông vụ', path: '/agri-map', icon: <MapRounded fontSize="small" />, color: 'bg-purple-500' },
  ], []);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 gap-4">
            
            {/* Logo */}
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer" 
              onClick={() => navigate('/')}
              role="button"
              aria-label="Về trang chủ NôngLạc"
            >
              <img src={logo} alt="NôngLạc Logo" className="h-8 w-auto" />
            </div>

            {/* Search Bar - Logic mới cho Mobile */}
            <div className={`flex-1 max-w-lg transition-all duration-300 ${isMobileSearchVisible ? 'absolute inset-x-0 top-0 h-full bg-white z-[60] flex items-center px-4 md:relative md:inset-auto md:bg-transparent md:px-0 md:mx-4' : 'hidden md:flex md:mx-4'}`}>
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchRounded className="text-gray-400 group-focus-within:text-[#4CAF50] transition-colors" sx={{ fontSize: 20 }} />
                </div>
                <input 
                  className="block w-full pl-9 pr-10 py-1.5 border border-gray-200 rounded-full leading-5 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition duration-150 ease-in-out shadow-sm" 
                  placeholder="Tìm kiếm nông sản, tin tức..." 
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearch}
                  aria-label="Tìm kiếm nội dung"
                  autoFocus={isMobileSearchVisible}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                  {searchQuery && (
                    <button
                      onClick={handleSearch}
                      className="p-1 text-[#4CAF50] hover:text-[#388E3C]"
                      aria-label="Thực hiện tìm kiếm"
                    >
                      <ArrowForwardRounded sx={{ fontSize: 20 }} />
                    </button>
                  )}
                  {isMobileSearchVisible && (
                    <button 
                      onClick={() => setIsMobileSearchVisible(false)}
                      className="md:hidden text-gray-400 px-2 text-xs font-medium"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center space-x-4 text-xs font-medium text-gray-600">
              <button 
                onClick={() => navigate('/')}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  location.pathname === '/' ? 'text-[#4CAF50]' : 'hover:text-[#4CAF50]'
                }`}
                aria-label="Trang chủ"
              >
                <HomeRounded sx={{ fontSize: 20 }} />
                <span>Trang chủ</span>
              </button>
              
              <button 
                onClick={() => navigate('/missions')}
                className="flex flex-col items-center gap-0.5 hover:text-[#4CAF50] transition-colors group"
                aria-label="Nhiệm vụ"
              >
                <EmojiEventsRounded className="group-hover:scale-110 transition-transform" sx={{ fontSize: 20 }} />
                <span>Nhiệm vụ</span>
              </button>
              
              {/* AI Tools Dropdown */}
              <div className="relative group cursor-pointer flex flex-col items-center gap-0.5 hover:text-[#4CAF50] transition-colors">
                <PsychologyAltRounded className="group-hover:scale-110 transition-transform" sx={{ fontSize: 22 }} />
                <div className="flex items-center">
                  AI 
                  <ExpandMoreRounded sx={{ fontSize: 16, ml: 0.2 }} />
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
                      {item.icon}
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/marketplace')}
                className="flex flex-col items-center gap-0.5 hover:text-[#4CAF50] transition-colors group"
                aria-label="Chợ nông sản"
              >
                <StorefrontRounded className="group-hover:scale-110 transition-transform" sx={{ fontSize: 20 }} />
                <span>Chợ</span>
              </button>
              
              <button 
                onClick={() => user ? navigate('/profile') : navigate('/phone-login')}
                className="flex flex-col items-center gap-0.5 hover:text-[#4CAF50] transition-colors group"
                aria-label="Hồ sơ cá nhân"
              >
                <PersonRounded className="group-hover:scale-110 transition-transform" sx={{ fontSize: 20 }} />
                <span>Profile</span>
              </button>
            </nav>

            {/* User Actions */}
            <div className={`flex items-center gap-1.5 sm:gap-2 ${isMobileSearchVisible ? 'hidden md:flex' : 'flex'}`}>
              {/* Mobile Search Trigger */}
              <button 
                className="md:hidden p-1.5 text-gray-500 hover:text-[#4CAF50]"
                onClick={() => setIsMobileSearchVisible(true)}
                aria-label="Mở tìm kiếm"
              >
                <SearchRounded />
              </button>

            {/* Messages - chỉ hiện khi đã đăng nhập */}
              {user && (
                <button 
                  onClick={() => navigate('/messages')}
                  className="relative p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-[#4CAF50] transition-colors"
                  aria-label="Tin nhắn"
                >
                  <ChatRounded sx={{ fontSize: 22 }} />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
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
                    className="hidden sm:block text-gray-700 hover:text-[#4CAF50] font-medium text-[11px] transition-colors whitespace-nowrap"
                  >
                    Đăng ký
                  </button>
                  
                  <button 
                    onClick={() => navigate('/phone-login')}
                    className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-semibold shadow-lg shadow-green-500/30 transition-all whitespace-nowrap"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quick access links for About/Policy pages */}
      <div className="border-b border-green-100 bg-[#F8FFF5]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-xs sm:text-sm">
          <button
            onClick={() => navigate('/about-us')}
            className={`font-medium transition-colors ${
              location.pathname === '/about-us' ? 'text-[#2E7D32]' : 'text-gray-700 hover:text-[#2E7D32]'
            }`}
          >
            Giới thiệu
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => navigate('/terms-of-service')}
            className={`font-medium transition-colors ${
              location.pathname === '/terms-of-service' || location.pathname === '/privacy'
                ? 'text-[#2E7D32]'
                : 'text-gray-700 hover:text-[#2E7D32]'
            }`}
          >
            Điều khoản & Bảo mật
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 text-gray-600">
        <div className="flex justify-center items-end px-4 py-3 relative">
          {/* Left side - 2 items */}
          <div className="flex-1 flex justify-around">
            <button 
              onClick={() => navigate('/')}
              className={`flex flex-col items-center ${location.pathname === '/' ? 'text-[#4CAF50]' : ''}`}
            >
              <HomeRounded />
              <span className="text-[10px]">Trang chủ</span>
            </button>
            
            <button 
              onClick={() => navigate('/missions')}
              className={`flex flex-col items-center ${location.pathname === '/missions' ? 'text-[#4CAF50]' : ''}`}
            >
              <EmojiEventsRounded />
              <span className="text-[10px]">Nhiệm vụ</span>
            </button>
          </div>
          
          {/* Center AI Button */}
          <div className="relative mx-4">
            <button 
              onClick={() => setShowMobileAiMenu(!showMobileAiMenu)}
              className="relative -top-6 bg-gradient-to-tr from-[#4CAF50] to-[#8BC34A] p-4 rounded-full text-white shadow-lg shadow-green-500/40 flex items-center justify-center transition-transform active:scale-90"
              aria-label="Công cụ AI"
            >
              <PsychologyAltRounded sx={{ fontSize: 28 }} />
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
                    {item.icon}
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
              className={`flex flex-col items-center ${location.pathname === '/marketplace' ? 'text-[#4CAF50]' : ''}`}
            >
              <StorefrontRounded />
              <span className="text-[10px]">Chợ</span>
            </button>
            
            <button 
              onClick={() => user ? navigate('/messages') : navigate('/phone-login')}
              className={`flex flex-col items-center relative ${location.pathname === '/messages' ? 'text-[#4CAF50]' : ''}`}
              aria-label="Tin nhắn"
            >
              <ChatRounded />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 right-2 bg-red-500 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center font-bold border border-white">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </span>
              )}
              <span className="text-[10px]">Tin nhắn</span>
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
