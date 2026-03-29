import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { 
  LogOut, 
  Menu,
  X,
  Settings
} from 'lucide-react';
import { Drawer, Button } from 'antd';
import { ADMIN_CONSTANTS } from '../constants';

const AdminLayout = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    // Lấy tab từ query param (để hỗ trợ các link cũ)
    const queryTab = new URLSearchParams(location.search).get('tab');
    
    // Lấy tab từ path (/admin/:tab)
    const pathParts = location.pathname.split('/');
    const currentTab = pathParts.length > 2 ? pathParts[2] : (queryTab || 'dashboard');
    
    // Lấy target tab từ path hoặc query của mục menu
    const targetPathParts = path.split('?');
    const targetBase = targetPathParts[0];
    const targetQuery = targetPathParts[1] ? new URLSearchParams(targetPathParts[1]).get('tab') : null;
    const targetTab = targetBase.split('/').length > 2 ? targetBase.split('/')[2] : (targetQuery || 'dashboard');
    
    return currentTab === targetTab;
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6 border-b bg-gray-50/50">
        <h1 className="text-2xl font-bold text-agri-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-agri-600 rounded-lg flex items-center justify-center shadow-sm">
            <Settings className="text-white w-5 h-5" />
          </div>
          Admin
        </h1>
        <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-agri-100 flex items-center justify-center text-agri-700 font-bold text-xs">
            {userProfile?.displayName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{userProfile?.displayName || 'Admin'}</p>
            <p className="text-[10px] text-agri-600 font-medium uppercase">NôngLạc Team</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">QUẢN TRỊ</div>
        {ADMIN_CONSTANTS.MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                active
                  ? 'bg-agri-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-agri-600'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold text-[14px]">{item.label}</span>
            </button>
          );
        })}
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-[14px]">Đăng xuất</span>
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col flex-shrink-0 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-agri-600 rounded flex items-center justify-center">
              <Settings className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-agri-700">Admin Panel</h1>
          </div>
          <Button 
            type="text" 
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100"
            icon={<Menu className="w-6 h-6 text-gray-600" />} 
            onClick={() => setMobileMenuOpen(true)}
          />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Drawer
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
        width={280}
        closable={false}
      >
        <div className="h-full relative">
          <Button 
            type="text" 
            icon={<X className="w-6 h-6 text-gray-400" />} 
            className="absolute top-5 right-4 z-50 flex items-center justify-center w-10 h-10"
            onClick={() => setMobileMenuOpen(false)}
          />
          <SidebarContent />
        </div>
      </Drawer>
    </div>
  );
};

export default AdminLayout;