import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { Home, Users, ShoppingBag, MessageCircle, Newspaper, Bookmark } from 'lucide-react';

import logo from '../assets/images/logo.demo.nontext.png';

const ResponsiveNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    { text: 'Chợ', path: '/marketplace', icon: ShoppingBag },
    { text: 'Bài viết đã lưu', path: '/saved', icon: Bookmark },
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
              {user && (
                <button
                  onClick={() => navigate('/messages')}
                  className="p-2 text-gray-600 hover:text-[#4CAF50] transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
              )}
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
            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`${
                    window.location.pathname === item.path
                      ? 'text-[#4CAF50] font-medium'
                      : 'text-gray-600 hover:text-[#4CAF50]'
                  } transition-colors`}
                >
                  {item.text}
                </button>
              ))}
              
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
                <button
                  onClick={() => navigate('/login')}
                  className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#45a049] transition-colors"
                >
                  Đăng nhập
                </button>
              )}
            </div>


          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-[#4CAF50]' 
                    : 'text-gray-600 hover:text-[#4CAF50]'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-[#4CAF50]' : 'text-gray-600'}`} />
                <span className={`text-xs mt-1 ${isActive ? 'text-[#4CAF50] font-medium' : 'text-gray-600'}`}>
                  {item.text}
                </span>
              </button>
            );
          })}
          {/* Profile button */}
          <button
            onClick={() => user ? navigate('/profile') : navigate('/login')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              location.pathname === '/profile'
                ? 'text-[#4CAF50]' 
                : 'text-gray-600 hover:text-[#4CAF50]'
            }`}
          >
            {user ? (
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                location.pathname === '/profile' ? 'bg-[#4CAF50]' : 'bg-gray-400'
              }`}>
                <span className="text-white text-xs font-medium">
                  {userProfile?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-white text-xs font-medium">?</span>
              </div>
            )}
            <span className={`text-xs mt-1 ${
              location.pathname === '/profile' ? 'text-[#4CAF50] font-medium' : 'text-gray-600'
            }`}>
              {user ? 'Profile' : 'Đăng nhập'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(ResponsiveNavbar);