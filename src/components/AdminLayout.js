import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, FileText, DollarSign, ShoppingBag, BookOpen, BarChart3, Settings, Bot, LogOut } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin' },
    { id: 'users', label: 'Người dùng', icon: Users, path: '/admin?tab=users' },
    { id: 'posts', label: 'Bài viết', icon: FileText, path: '/admin?tab=posts' },
    { id: 'products', label: 'Sản phẩm', icon: ShoppingBag, path: '/admin?tab=products' },
    { id: 'prices', label: 'Giá nông sản', icon: DollarSign, path: '/admin?tab=prices' },
    { id: 'lessons', label: 'Bài học', icon: BookOpen, path: '/lessons' },
    { id: 'bot', label: '🤖 Auto Bot', icon: Bot, path: '/admin?tab=bot' },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3, path: '/admin?tab=analytics' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/admin?tab=settings' },
  ];

  const isActive = (path) => {
    if (path === '/lessons') {
      return location.pathname === '/lessons';
    }
    return location.pathname === '/admin' && location.search === path.split('?')[1];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-[#4CAF50]">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">{userProfile?.displayName}</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#4CAF50] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mt-4 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
