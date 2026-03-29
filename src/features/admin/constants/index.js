import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  ShoppingBag,
  BarChart3,
  Settings,
  Edit,
  RefreshCw,
  Database,
  Wrench,
  UserCheck,
  Video
} from 'lucide-react';

export const ADMIN_CONSTANTS = {
  SECURITY_CODE: 'NL_2026_AD_8f2a9c1b7d',

  MENU_ITEMS: [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin' },
    { id: 'users', label: 'Người dùng', icon: Users, path: '/admin/users' },
    { id: 'student-referral', label: 'Sinh viên & Giới thiệu', icon: UserCheck, path: '/admin/student-referral' },
    { id: 'posts', label: 'Bài viết', icon: FileText, path: '/admin/posts' },
    { id: 'products', label: 'Sản phẩm', icon: ShoppingBag, path: '/admin/products' },
    { id: 'prices', label: 'Giá nông sản', icon: DollarSign, path: '/admin/prices' },
    { id: 'crawler-data', label: 'Dữ liệu Crawler', icon: Database, path: '/admin/crawler-data' },
    { id: 'auto-video', label: 'Video tự động', icon: Video, path: '/admin/auto-video' },
    { id: 'post-creator', label: 'Tạo bài thử', icon: Edit, path: '/admin/post-creator' },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3, path: '/admin/analytics' },
    { id: 'version', label: 'Version & Cache', icon: RefreshCw, path: '/admin/version' },
    { id: 'badge-tools', label: 'Badge Tools', icon: Wrench, path: '/admin/badge-tools' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/admin/settings' }
  ]
};
