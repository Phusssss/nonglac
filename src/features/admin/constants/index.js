import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Edit, 
  RefreshCw 
} from 'lucide-react';

export const ADMIN_CONSTANTS = {
  SECURITY_CODE: 'NL_2026_AD_8f2a9c1b7d',
  
  MENU_ITEMS: [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin' },
    { id: 'users', label: 'Người dùng', icon: Users, path: '/admin?tab=users' },
    { id: 'posts', label: 'Bài viết', icon: FileText, path: '/admin?tab=posts' },
    { id: 'products', label: 'Sản phẩm', icon: ShoppingBag, path: '/admin?tab=products' },
    { id: 'prices', label: 'Giá nông sản', icon: DollarSign, path: '/admin?tab=prices' },
    { id: 'post-creator', label: 'Tạo bài thử', icon: Edit, path: '/admin?tab=post-creator' },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3, path: '/admin?tab=analytics' },
    { id: 'version', label: 'Version & Cache', icon: RefreshCw, path: '/admin?tab=version' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/admin?tab=settings' },
  ]
};