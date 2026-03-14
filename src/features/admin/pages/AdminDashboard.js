import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message, Card } from 'antd';

import AdminLayout from '../components/AdminLayout';
import AdminSecurityGate from '../components/AdminSecurityGate';
import DashboardOverview from '../components/DashboardOverview';
import UserManagement from '../components/UserManagement';
import StudentReferralManagement from '../components/StudentReferralManagement';
import PostManagement from '../components/PostManagement';
import PriceManagement from '../components/PriceManagement';
import ProductManagement from '../components/ProductManagement';
import SystemAnalytics from '../components/SystemAnalytics';
import AdminPostCreator from '../components/AdminPostCreator';
import VersionManager from '../components/VersionManager';
import CrawlerDataManagement from '../components/CrawlerDataManagement';
import BadgeCleanupTool from '../components/BadgeCleanupTool';

import { useAdminData } from '../hooks/useAdminData';
import { adminService } from '../services/adminService';
import subscriptionService from '../../../services/subscriptionService';

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const {
    loading,
    stats,
    users,
    posts,
    pricesData,
    products,
    analytics,
    loadStats,
    loadTabData,
    setUsers,
    setPosts,
    setProducts,
    setPricesData
  } = useAdminData();

  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('admin_authenticated') === 'true');
  const [securityCode, setSecurityCode] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadTabData(activeTab);
    }
  }, [isAuthenticated, activeTab, loadStats, loadTabData]);

  const handleResetApprenticeQuotas = async () => {
    if (!window.confirm('Reset quota cho tất cả user gói TẬP SỰ?')) return;
    setResetLoading(true);
    try {
      const res = await subscriptionService.resetApprenticeQuotas();
      setResetMessage(res.success ? `✅ Đã reset cho ${res.count} user` : `❌ Lỗi: ${res.error}`);
    } catch (e) { setResetMessage('❌ Lỗi hệ thống'); }
    setResetLoading(false);
  };

  if (!isAuthenticated) return <AdminSecurityGate securityCode={securityCode} setSecurityCode={setSecurityCode} setIsAuthenticated={setIsAuthenticated} />;

  const renderContent = () => {
    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
    
    switch (activeTab) {
      case 'dashboard': 
        return <DashboardOverview stats={stats} handleResetApprenticeQuotas={handleResetApprenticeQuotas} resetLoading={resetLoading} resetMessage={resetMessage} />;
      
      case 'users': 
        return (
          <UserManagement 
            users={users} 
            updateUserRole={async (id, role) => { 
              await adminService.updateUserRole(id, role);
              loadTabData('users');
              message.success('Đã cập nhật'); 
            }} 
            verifyUser={async (id) => { 
              try {
                await adminService.verifyUser(id);
                message.success('Đã xác thực và cập nhật nhiệm vụ');
                loadTabData('users'); 
              } catch (e) { message.error(e.message); }
            }}
            unverifyUser={async (id) => { 
              try {
                const result = await adminService.unverifyUser(id);
                if (result.pointsDeducted > 0) {
                  message.success(`Đã hủy xác thực và trừ ${result.pointsDeducted} điểm`);
                } else {
                  message.success('Đã hủy xác thực');
                }
                loadTabData('users'); 
              } catch (e) { message.error(e.message); }
            }}
            deleteUser={async (id) => { 
              await adminService.deleteUser(id);
              loadTabData('users');
              message.success('Đã xóa'); 
            }} 
          />
        );
      
      case 'student-referral': 
        return <StudentReferralManagement />; 
        return <PostManagement posts={posts} deletePost={async (id) => { await adminService.deletePost(id); loadTabData('posts'); message.success('Đã xóa'); }} />;
      
      case 'prices': 
        return (
          <PriceManagement 
            prices={pricesData.prices} 
            setPrices={(p) => setPricesData(prev => ({ ...prev, prices: p }))} 
            categories={pricesData.categories} 
            setCategories={(c) => setPricesData(prev => ({ ...prev, categories: c }))} 
          />
        );
      
      case 'products': 
        return <ProductManagement products={products} setProducts={setProducts} />;
      
      case 'analytics': 
        return <SystemAnalytics analytics={analytics} totalPosts={stats.totalPosts} />;
      
      case 'post-creator': return <AdminPostCreator />;
      case 'version': return <VersionManager />;
      case 'crawler-data': return <CrawlerDataManagement />;
      case 'badge-tools': return <BadgeCleanupTool />;
      case 'settings': return <Card>Cài đặt hệ thống đang phát triển...</Card>;
      default: return null;
    }
  };

  return <AdminLayout>{renderContent()}</AdminLayout>;
};

export default AdminDashboard;
