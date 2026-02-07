import { useState, useCallback } from 'react';
import { adminService } from '../services/adminService';

export const useAdminData = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalProducts: 0 });
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pricesData, setPricesData] = useState({ prices: [], categories: [] });
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({ topUsers: [], postsByCategory: [], recentActivity: [], actionStats: [] });

  const loadStats = useCallback(async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (e) { console.error(e); }
  }, []);

  const loadTabData = useCallback(async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'users':
          setUsers(await adminService.getUsers());
          break;
        case 'posts':
          setPosts(await adminService.getPosts());
          break;
        case 'prices':
          setPricesData(await adminService.getPrices());
          break;
        case 'products':
          setProducts(await adminService.getProducts());
          break;
        case 'analytics':
          setAnalytics(await adminService.getAnalytics());
          break;
        default:
          break;
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  return {
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
  };
};