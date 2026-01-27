import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { message } from 'antd';

import AdminLayout from './components/AdminLayout';
import AdminSecurityGate from './components/AdminSecurityGate';
import DashboardOverview from './components/DashboardOverview';
import UserManagement from './components/UserManagement';
import PostManagement from './components/PostManagement';
import PriceManagement from './components/PriceManagement';
import ProductManagement from './components/ProductManagement';
import SystemAnalytics from './components/SystemAnalytics';
import AdminPostCreator from './components/AdminPostCreator';
import VersionManager from './components/VersionManager';

import subscriptionService from '../../services/subscriptionService';
import { missionsService } from '../missions/services';

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalProducts: 0 });
  const [analytics, setAnalytics] = useState({ topUsers: [], postsByCategory: [], recentActivity: [], actionStats: [] });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('admin_authenticated') === 'true');
  const [securityCode, setSecurityCode] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  const loadStats = async () => {
    try {
      const [u, p, m] = await Promise.all([getDocs(collection(db, 'users')), getDocs(collection(db, 'posts')), getDocs(collection(db, 'marketplace_products'))]);
      setStats({ totalUsers: u.size, totalPosts: p.size, totalProducts: m.size });
    } catch (e) { console.error(e); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else if (activeTab === 'posts') {
        const snap = await getDocs(collection(db, 'posts'));
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else if (activeTab === 'prices') {
        const [p, c] = await Promise.all([getDocs(collection(db, 'prices')), getDocs(collection(db, 'priceCategories'))]);
        setPrices(p.docs.map(d => ({ id: d.id, ...d.data() })));
        setCategories(c.docs.map(d => ({ id: d.id, ...d.data() })));
      } else if (activeTab === 'products') {
        const snap = await getDocs(collection(db, 'marketplace_products'));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else if (activeTab === 'analytics') {
        const [u, p, a] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('reputation', 'desc'), limit(10))),
          getDocs(collection(db, 'posts')),
          getDocs(query(collection(db, 'userActions'), orderBy('timestamp', 'desc'), limit(100)))
        ]);
        const allPosts = p.docs.map(d => d.data());
        const catCount = {};
        allPosts.forEach(i => catCount[i.category] = (catCount[i.category] || 0) + 1);
        const actCount = {};
        const actions = a.docs.map(d => d.data());
        actions.forEach(i => actCount[i.action] = (actCount[i.action] || 0) + 1);
        
        setAnalytics({
          topUsers: u.docs.map(d => ({ id: d.id, ...d.data() })),
          postsByCategory: Object.entries(catCount).map(([name, count]) => ({ name, count })),
          actionStats: Object.entries(actCount).map(([action, count]) => ({ action, count })),
          recentActivity: a.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 20)
        });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

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
      case 'dashboard': return <DashboardOverview stats={stats} handleResetApprenticeQuotas={handleResetApprenticeQuotas} resetLoading={resetLoading} resetMessage={resetMessage} />;
      case 'users': return (
        <UserManagement 
          users={users} 
          updateUserRole={async (id, role) => { 
            await updateDoc(doc(db, 'users', id), { role }); 
            loadData(); 
            message.success('Đã cập nhật'); 
          }} 
          verifyUser={async (id) => { 
            setLoading(true);
            try {
              // 1. Cập nhật trạng thái verified trong user profile
              await updateDoc(doc(db, 'users', id), { verificationStatus: 'verified' }); 
              
              // 2. Kích hoạt hoàn thành nhiệm vụ verify_phone trong hệ thống missions
              await missionsService.verifyUserPhone(id);
              
              message.success('Đã xác thực và cập nhật nhiệm vụ thành công');
              loadData(); 
            } catch (error) {
              message.error('Lỗi khi xác thực: ' + error.message);
            }
            setLoading(false);
          }} 
          deleteUser={async (id) => { 
            await deleteDoc(doc(db, 'users', id)); 
            loadData(); 
            message.success('Đã xóa'); 
          }} 
        />
      );
      case 'posts': return <PostManagement posts={posts} deletePost={async (id) => { await deleteDoc(doc(db, 'posts', id)); loadData(); message.success('Đã xóa'); }} />;
      case 'prices': return <PriceManagement prices={prices} setPrices={setPrices} categories={categories} setCategories={setCategories} />;
      case 'products': return <ProductManagement products={products} setProducts={setProducts} />;
      case 'analytics': return <SystemAnalytics analytics={analytics} totalPosts={stats.totalPosts} />;
      case 'post-creator': return <AdminPostCreator />;
      case 'version': return <VersionManager />;
      case 'settings': return <Card>Cài đặt hệ thống đang phát triển...</Card>;
      default: return null;
    }
  };

  return <AdminLayout>{renderContent()}</AdminLayout>;
};

export default AdminDashboard;