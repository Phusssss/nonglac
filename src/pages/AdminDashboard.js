import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const PriceManagement = ({ prices, setPrices }) => {
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
              <option value="Lúa gạo">Lúa gạo</option>
              <option value="Cà phê">Cà phê</option>
              <option value="Gia vị">Gia vị</option>
              <option value="Thủy sản">Thủy sản</option>
              <option value="Nông sản khác">Nông sản khác</option>
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
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin' || userProfile?.email === 'admin@nonglac.com';

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab]);

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
        const pricesSnapshot = await getDocs(collection(db, 'prices'));
        setPrices(pricesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Vui lòng đăng nhập</div>;
  }

  if (!isAdmin) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Bạn không có quyền truy cập trang này</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#4CAF50', marginBottom: '30px' }}>Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
        {['users', 'posts', 'prices'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#4CAF50' : 'transparent',
              color: activeTab === tab ? 'white' : '#333',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {tab === 'users' ? 'Người dùng' : tab === 'posts' ? 'Bài viết' : 'Giá nông sản'}
          </button>
        ))}
      </div>

      {loading && <div>Đang tải...</div>}

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
        <PriceManagement prices={prices} setPrices={setPrices} />
      )}
    </div>
  );
};

export default AdminDashboard;