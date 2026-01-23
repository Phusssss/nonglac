import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import AdminLayout from '../components/AdminLayout';
import AutoPostBot from '../components/AutoPostBot';
import subscriptionService from '../services/subscriptionService';
import { Users, FileText, ShoppingBag, BookOpen, RefreshCw, Lock } from 'lucide-react';
import { Input, Button, Card, Typography, message } from 'antd';

const { Title, Text } = Typography;

const CategoryManagement = ({ categories, setCategories }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  const addCategory = async () => {
    if (!name.trim()) return alert('Vui lòng nhập tên danh mục');
    try {
      const docRef = await addDoc(collection(db, 'priceCategories'), { name: name.trim(), createdAt: new Date() });
      setCategories([...categories, { id: docRef.id, name: name.trim() }]);
      setName('');
      setShowForm(false);
      alert('Đã thêm danh mục');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const updateCategory = async () => {
    if (!name.trim()) return alert('Vui lòng nhập tên danh mục');
    try {
      await updateDoc(doc(db, 'priceCategories', editing.id), { name: name.trim() });
      setCategories(categories.map(c => c.id === editing.id ? { ...c, name: name.trim() } : c));
      setEditing(null);
      setName('');
      alert('Đã cập nhật');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Xác nhận xóa danh mục này?')) {
      try {
        await deleteDoc(doc(db, 'priceCategories', id));
        setCategories(categories.filter(c => c.id !== id));
        alert('Đã xóa');
      } catch (error) {
        alert('Lỗi: ' + error.message);
      }
    }
  };

  return (
    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Danh mục giá nông sản ({categories.length})</h3>
        <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Thêm danh mục</button>
      </div>

      {(showForm || editing) && (
        <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
          <input type="text" placeholder="Tên danh mục" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '300px', marginRight: '10px' }} />
          <button onClick={editing ? updateCategory : addCategory} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>{editing ? 'Cập nhật' : 'Thêm'}</button>
          <button onClick={() => { setShowForm(false); setEditing(null); setName(''); }} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ backgroundColor: 'white', padding: '10px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{cat.name}</span>
            <button onClick={() => { setEditing(cat); setName(cat.name); }} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Sửa</button>
            <button onClick={() => deleteCategory(cat.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PriceManagement = ({ prices, setPrices, categories }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    currentPrice: '',
    unit: '',
    market: '',
    category: ''
  });

  const addPrice = async () => {
    try {
      const newPrice = {
        ...formData,
        currentPrice: parseFloat(formData.currentPrice),
        previousPrice: parseFloat(formData.currentPrice) * 0.98,
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'prices'), newPrice);
      setPrices([...prices, { id: docRef.id, ...newPrice }]);
      setFormData({ productName: '', currentPrice: '', unit: '', market: '', category: '' });
      setShowAddForm(false);
      alert('Đã thêm sản phẩm');
    } catch (error) {
      alert('Lỗi thêm sản phẩm: ' + error.message);
    }
  };

  const updatePrice = async () => {
    try {
      await updateDoc(doc(db, 'prices', editingPrice.id), {
        ...formData,
        currentPrice: parseFloat(formData.currentPrice),
        updatedAt: new Date()
      });
      
      setPrices(prices.map(p => p.id === editingPrice.id ? 
        { ...p, ...formData, currentPrice: parseFloat(formData.currentPrice) } : p
      ));
      
      setEditingPrice(null);
      setFormData({ productName: '', currentPrice: '', unit: '', market: '', category: '' });
      alert('Đã cập nhật sản phẩm');
    } catch (error) {
      alert('Lỗi cập nhật: ' + error.message);
    }
  };

  const deletePrice = async (priceId) => {
    if (window.confirm('Xác nhận xóa sản phẩm này?')) {
      try {
        await deleteDoc(doc(db, 'prices', priceId));
        setPrices(prices.filter(p => p.id !== priceId));
        alert('Đã xóa sản phẩm');
      } catch (error) {
        alert('Lỗi xóa sản phẩm: ' + error.message);
      }
    }
  };

  const startEdit = (price) => {
    setEditingPrice(price);
    setFormData({
      productName: price.productName,
      currentPrice: price.currentPrice.toString(),
      unit: price.unit,
      market: price.market,
      category: price.category || ''
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quản lý giá nông sản ({prices.length})</h2>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingPrice) && (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>{editingPrice ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <input
              type="text"
              placeholder="Tên sản phẩm"
              value={formData.productName}
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="number"
              placeholder="Giá hiện tại"
              value={formData.currentPrice}
              onChange={(e) => setFormData({...formData, currentPrice: e.target.value})}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Đơn vị (kg, tấn...)"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Thị trường"
              value={formData.market}
              onChange={(e) => setFormData({...formData, market: e.target.value})}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={editingPrice ? updatePrice : addPrice}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              {editingPrice ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingPrice(null);
                setFormData({ productName: '', currentPrice: '', unit: '', market: '', category: '' });
              }}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Prices Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Sản phẩm</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Giá hiện tại</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Đơn vị</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Thị trường</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Danh mục</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Cập nhật</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {prices.slice(0, 50).map(price => (
              <tr key={price.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{price.productName}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {new Intl.NumberFormat('vi-VN').format(price.currentPrice)}đ
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{price.unit}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{price.market}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{price.category}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {price.updatedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => startEdit(price)}
                    style={{
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deletePrice(price.id)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalProducts: 0, totalLessons: 0 });
  const [analytics, setAnalytics] = useState({ topUsers: [], postsByCategory: [], recentActivity: [], actionStats: [] });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  // Security code authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [authError, setAuthError] = useState('');

  const ADMIN_SECURITY_CODE = 'Corenonglac05122025';

  const handleSecurityCodeSubmit = () => {
    if (securityCode === ADMIN_SECURITY_CODE) {
      setIsAuthenticated(true);
      setAuthError('');
      message.success('Đăng nhập thành công!');
    } else {
      setAuthError('Mã bảo mật không đúng!');
      message.error('Mã bảo mật không đúng!');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadStats();
    }
  }, [isAuthenticated, activeTab]);

  const loadStats = async () => {
    try {
      const [usersSnap, postsSnap, productsSnap, lessonsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'posts')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'lessons'))
      ]);
      setStats({
        totalUsers: usersSnap.size,
        totalPosts: postsSnap.size,
        totalProducts: productsSnap.size,
        totalLessons: lessonsSnap.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'posts') {
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        setPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'prices') {
        const [pricesSnapshot, categoriesSnapshot] = await Promise.all([
          getDocs(collection(db, 'prices')),
          getDocs(collection(db, 'priceCategories'))
        ]);
        setPrices(pricesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'products') {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'analytics') {
        const [usersSnap, postsSnap, actionsSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('reputation', 'desc'), limit(10))),
          getDocs(collection(db, 'posts')),
          getDocs(query(collection(db, 'userActions'), orderBy('timestamp', 'desc'), limit(100)))
        ]);
        const topUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const allPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const allActions = actionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const categoryCount = {};
        allPosts.forEach(p => {
          categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        });
        const postsByCategory = Object.entries(categoryCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
        
        const actionCount = {};
        allActions.forEach(a => {
          actionCount[a.action] = (actionCount[a.action] || 0) + 1;
        });
        const actionStats = Object.entries(actionCount).map(([action, count]) => ({ action, count })).sort((a, b) => b.count - a.count);
        
        const recentActivity = allActions.slice(0, 20);
        setAnalytics({ topUsers, postsByCategory, recentActivity, actionStats });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Xác nhận xóa người dùng này?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(u => u.id !== userId));
        alert('Đã xóa người dùng');
      } catch (error) {
        alert('Lỗi xóa người dùng: ' + error.message);
      }
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm('Xác nhận xóa bài viết này?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        setPosts(posts.filter(p => p.id !== postId));
        alert('Đã xóa bài viết');
      } catch (error) {
        alert('Lỗi xóa bài viết: ' + error.message);
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('Đã cập nhật quyền người dùng');
    } catch (error) {
      alert('Lỗi cập nhật: ' + error.message);
    }
  };

  const handleResetApprenticeQuotas = async () => {
    if (!window.confirm('Bạn có chắc muốn reset quota cho tất cả user gói TẬP SỰ?')) {
      return;
    }

    setResetLoading(true);
    setResetMessage('');

    try {
      const result = await subscriptionService.resetApprenticeQuotas();
      
      if (result.success) {
        setResetMessage(`✅ Đã reset quota thành công cho ${result.count} user gói TẬP SỰ`);
        loadStats();
      } else {
        setResetMessage(`❌ Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error('Error resetting quotas:', error);
      setResetMessage('❌ Có lỗi xảy ra khi reset quota');
    } finally {
      setResetLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-[#795548] mx-auto mb-4" />
            <Title level={2} className="text-[#795548]">Admin Dashboard</Title>
            <Text type="secondary">Nhập mã bảo mật để truy cập</Text>
          </div>
          
          <div className="space-y-4">
            <Input.Password
              placeholder="Nhập mã bảo mật"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              onPressEnter={handleSecurityCodeSubmit}
              size="large"
            />
            
            {authError && (
              <div className="text-red-500 text-sm text-center">{authError}</div>
            )}
            
            <Button 
              type="primary" 
              size="large" 
              block
              onClick={handleSecurityCodeSubmit}
              className="bg-[#795548] hover:bg-[#6d4c41]"
            >
              Xác thực
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold text-[#795548] mb-6">Tổng quan hệ thống</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Người dùng</p>
                      <p className="text-3xl font-bold text-[#4CAF50] mt-2">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-12 h-12 text-[#4CAF50] opacity-20" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Bài viết</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalPosts}</p>
                    </div>
                    <FileText className="w-12 h-12 text-blue-600 opacity-20" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Sản phẩm</p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalProducts}</p>
                    </div>
                    <ShoppingBag className="w-12 h-12 text-orange-600 opacity-20" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Bài học</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalLessons}</p>
                    </div>
                    <BookOpen className="w-12 h-12 text-purple-600 opacity-20" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold text-[#795548] mb-4">Quản lý Quota</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <h4 className="font-semibold text-green-800">Reset Quota Gói TẬP SỰ</h4>
                      <p className="text-sm text-green-600">
                        Reset lại quota về mặc định (100 câu hỏi AI, 100 bác sĩ AI, 100 bản đồ, 100 thị trường) cho tất cả user gói TẬP SỰ
                      </p>
                    </div>
                    <button
                      onClick={handleResetApprenticeQuotas}
                      disabled={resetLoading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {resetLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang reset...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Reset Quota
                        </>
                      )}
                    </button>
                  </div>

                  {resetMessage && (
                    <div className={`p-4 rounded-lg ${resetMessage.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {resetMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading && <div className="text-center py-8">Đang tải...</div>}

          {/* Users Tab */}
          {activeTab === 'users' && (
        <div>
          <h2>Quản lý người dùng ({users.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tên</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Uy tín</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Quyền</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ngày tham gia</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.displayName}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.reputation || 0}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        style={{ padding: '5px' }}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {user.joinDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button
                        onClick={() => deleteUser(user.id)}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
        <div>
          <h2>Quản lý bài viết ({posts.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tiêu đề</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tác giả</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Danh mục</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Likes</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ngày tạo</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {post.title?.substring(0, 50)}...
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{post.authorName}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{post.category}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{post.likes || 0}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {post.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button
                        onClick={() => deletePost(post.id)}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          )}

          {/* Prices Tab */}
          {activeTab === 'prices' && (
            <div>
              <CategoryManagement categories={categories} setCategories={setCategories} />
              <PriceManagement prices={prices} setPrices={setPrices} categories={categories} />
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <h2 className="text-2xl font-bold text-[#795548] mb-4">Quản lý sản phẩm ({products.length})</h2>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người bán</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.slice(0, 50).map(product => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.productName}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Intl.NumberFormat('vi-VN').format(product.price)}đ/{product.unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.productType}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.sellerName}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => deleteDoc(doc(db, 'products', product.id))}
                              className="text-red-600 hover:text-red-800"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          

          
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-[#795548] mb-6">Thống kê & Phân tích</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-[#795548] mb-4">Top 10 người dùng uy tín cao</h3>
                  <div className="space-y-3">
                    {analytics.topUsers.map((u, idx) => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#4CAF50]">#{idx + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{u.displayName}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-[#4CAF50]">{u.reputation || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-[#795548] mb-4">Thao tác người dùng</h3>
                  <div className="space-y-3">
                    {analytics.actionStats.map(stat => (
                      <div key={stat.action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-800">{stat.action}</span>
                        <span className="text-sm font-bold text-[#4CAF50]">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-[#795548] mb-4">Bài viết theo danh mục</h3>
                  <div className="space-y-3">
                    {analytics.postsByCategory.map(cat => (
                      <div key={cat.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-800">{cat.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-[#4CAF50] h-2 rounded-full" style={{ width: `${(cat.count / stats.totalPosts) * 100}%` }}></div>
                          </div>
                          <span className="text-sm font-bold text-gray-600">{cat.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-[#795548] mb-4">Lịch sử thao tác gần đây</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.recentActivity.map(action => (
                        <tr key={action.id}>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {action.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">{action.userName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] rounded text-xs">{action.action}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{JSON.stringify(action.details)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Bot Tab */}
          {activeTab === 'bot' && (
            <div>
              <AutoPostBot />
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-[#795548] mb-4">Cài đặt</h2>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-gray-600">Cài đặt hệ thống đang phát triển...</p>
              </div>
            </div>
          )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;