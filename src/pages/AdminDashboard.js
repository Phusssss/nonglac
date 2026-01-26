import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import AdminLayout from '../components/AdminLayout';
import AdminPostCreator from '../components/AdminPostCreator';
import VersionManager from '../components/VersionManager';
import subscriptionService from '../services/subscriptionService';
import { Users, FileText, ShoppingBag, RefreshCw, Lock } from 'lucide-react';
import { 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Tag, 
  Table, 
  Space, 
  Select, 
  Form, 
  Modal,
  Popconfirm,
  Progress,
  Statistic,
  Row,
  Col,
  Divider
} from 'antd';

const { Title, Text } = Typography;

const CategoryManagement = ({ categories, setCategories }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const addCategory = async (values) => {
    try {
      const docRef = await addDoc(collection(db, 'priceCategories'), { 
        name: values.name.trim(), 
        createdAt: new Date() 
      });
      setCategories([...categories, { id: docRef.id, name: values.name.trim() }]);
      form.resetFields();
      setShowForm(false);
      message.success('Đã thêm danh mục');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const updateCategory = async (values) => {
    try {
      await updateDoc(doc(db, 'priceCategories', editing.id), { name: values.name.trim() });
      setCategories(categories.map(c => c.id === editing.id ? { ...c, name: values.name.trim() } : c));
      setEditing(null);
      form.resetFields();
      message.success('Đã cập nhật');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'priceCategories', id));
      setCategories(categories.filter(c => c.id !== id));
      message.success('Đã xóa');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const startEdit = (category) => {
    setEditing(category);
    form.setFieldsValue({ name: category.name });
  };

  const cancelEdit = () => {
    setEditing(null);
    setShowForm(false);
    form.resetFields();
  };

  return (
    <Card title={`Danh mục giá nông sản (${categories.length})`} className="mb-6">
      <div className="mb-4">
        <Button 
          type="primary" 
          onClick={() => setShowForm(true)}
          className="bg-[#52c41a]"
        >
          Thêm danh mục
        </Button>
      </div>

      {(showForm || editing) && (
        <Card className="mb-4" size="small">
          <Form
            form={form}
            layout="inline"
            onFinish={editing ? updateCategory : addCategory}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
            >
              <Input placeholder="Tên danh mục" style={{ width: 300 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" className="bg-[#52c41a]">
                  {editing ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button onClick={cancelEdit}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Card key={cat.id} size="small" className="inline-block">
            <div className="flex items-center gap-2">
              <span>{cat.name}</span>
              <Space size="small">
                <Button 
                  size="small" 
                  type="primary" 
                  onClick={() => startEdit(cat)}
                >
                  Sửa
                </Button>
                <Popconfirm
                  title="Xác nhận xóa danh mục này?"
                  onConfirm={() => deleteCategory(cat.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button size="small" danger>Xóa</Button>
                </Popconfirm>
              </Space>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

const PriceManagement = ({ prices, setPrices, categories }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [form] = Form.useForm();

  const addPrice = async (values) => {
    try {
      const newPrice = {
        ...values,
        currentPrice: parseFloat(values.currentPrice),
        previousPrice: parseFloat(values.currentPrice) * 0.98,
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'prices'), newPrice);
      setPrices([...prices, { id: docRef.id, ...newPrice }]);
      form.resetFields();
      setShowAddForm(false);
      message.success('Đã thêm sản phẩm');
    } catch (error) {
      message.error('Lỗi thêm sản phẩm: ' + error.message);
    }
  };

  const updatePrice = async (values) => {
    try {
      await updateDoc(doc(db, 'prices', editingPrice.id), {
        ...values,
        currentPrice: parseFloat(values.currentPrice),
        updatedAt: new Date()
      });
      
      setPrices(prices.map(p => p.id === editingPrice.id ? 
        { ...p, ...values, currentPrice: parseFloat(values.currentPrice) } : p
      ));
      
      setEditingPrice(null);
      form.resetFields();
      message.success('Đã cập nhật sản phẩm');
    } catch (error) {
      message.error('Lỗi cập nhật: ' + error.message);
    }
  };

  const deletePrice = async (priceId) => {
    try {
      await deleteDoc(doc(db, 'prices', priceId));
      setPrices(prices.filter(p => p.id !== priceId));
      message.success('Đã xóa sản phẩm');
    } catch (error) {
      message.error('Lỗi xóa sản phẩm: ' + error.message);
    }
  };

  const startEdit = (price) => {
    setEditingPrice(price);
    form.setFieldsValue({
      productName: price.productName,
      currentPrice: price.currentPrice,
      unit: price.unit,
      market: price.market,
      category: price.category || ''
    });
  };

  const cancelEdit = () => {
    setEditingPrice(null);
    setShowAddForm(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Giá hiện tại',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price) => `${new Intl.NumberFormat('vi-VN').format(price)}đ`,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Thị trường',
      dataIndex: 'market',
      key: 'market',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category ? <Tag color="blue">{category}</Tag> : '-',
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date?.toDate?.()?.toLocaleDateString() || 'N/A',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => startEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa sản phẩm này?"
            onConfirm={() => deletePrice(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title={`Quản lý giá nông sản (${prices.length})`}
        extra={
          <Button 
            type="primary" 
            onClick={() => setShowAddForm(true)}
            className="bg-[#52c41a]"
          >
            Thêm sản phẩm
          </Button>
        }
      >
        {/* Add/Edit Form */}
        {(showAddForm || editingPrice) && (
          <Card className="mb-4" size="small">
            <Typography.Title level={4}>
              {editingPrice ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </Typography.Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={editingPrice ? updatePrice : addPrice}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="productName"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                  >
                    <Input placeholder="Tên sản phẩm" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="currentPrice"
                    label="Giá hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                  >
                    <Input type="number" placeholder="Giá hiện tại" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="unit"
                    label="Đơn vị"
                    rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                  >
                    <Input placeholder="Đơn vị (kg, tấn...)" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="market"
                    label="Thị trường"
                    rules={[{ required: true, message: 'Vui lòng nhập thị trường' }]}
                  >
                    <Input placeholder="Thị trường" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Danh mục"
                  >
                    <Select placeholder="Chọn danh mục" allowClear>
                      {categories.map(cat => (
                        <Select.Option key={cat.id} value={cat.name}>
                          {cat.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" className="bg-[#52c41a]">
                    {editingPrice ? 'Cập nhật' : 'Thêm'}
                  </Button>
                  <Button onClick={cancelEdit}>Hủy</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Prices Table */}
        <Table
          columns={columns}
          dataSource={prices.slice(0, 50)}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
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
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalProducts: 0 });
  const [analytics, setAnalytics] = useState({ topUsers: [], postsByCategory: [], recentActivity: [], actionStats: [] });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  // Security code authentication - Lưu vào sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [securityCode, setSecurityCode] = useState('');
  const [authError, setAuthError] = useState('');

  const ADMIN_SECURITY_CODE = 'NL_2026_AD_8f2a9c1b7d'; // Mã bảo mật mới ngẫu nhiên

  const handleSecurityCodeSubmit = () => {
    if (securityCode === ADMIN_SECURITY_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
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
      const [usersSnap, postsSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'posts')),
        getDocs(collection(db, 'marketplace_products'))
      ]);
      setStats({
        totalUsers: usersSnap.size,
        totalPosts: postsSnap.size,
        totalProducts: productsSnap.size
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
        const productsSnapshot = await getDocs(collection(db, 'marketplace_products'));
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
      message.success('Đã cập nhật quyền người dùng');
    } catch (error) {
      message.error('Lỗi cập nhật: ' + error.message);
    }
  };

  const verifyUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        verificationStatus: 'verified',
        updatedAt: new Date()
      });
      setUsers(users.map(u => u.id === userId ? { ...u, verificationStatus: 'verified' } : u));
      message.success('Đã xác thực người dùng thành công!');
    } catch (error) {
      message.error('Lỗi xác thực: ' + error.message);
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
              <Typography.Title level={2} className="text-[#795548] mb-6">
                Tổng quan hệ thống
              </Typography.Title>
              
              <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} lg={8}>
                  <Card>
                    <Statistic
                      title="Người dùng"
                      value={stats.totalUsers}
                      valueStyle={{ color: '#4CAF50' }}
                      prefix={<Users className="w-6 h-6" />}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Card>
                    <Statistic
                      title="Bài viết"
                      value={stats.totalPosts}
                      valueStyle={{ color: '#1890ff' }}
                      prefix={<FileText className="w-6 h-6" />}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Card>
                    <Statistic
                      title="Sản phẩm"
                      value={stats.totalProducts}
                      valueStyle={{ color: '#fa8c16' }}
                      prefix={<ShoppingBag className="w-6 h-6" />}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Card>
                <Typography.Title level={3} className="text-[#795548] mb-4">
                  Quản lý Quota
                </Typography.Title>
                <Card className="bg-green-50 border-green-200">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Typography.Title level={4} className="text-green-800 mb-2">
                        Reset Quota Gói TẬP SỰ
                      </Typography.Title>
                      <Typography.Text className="text-green-600">
                        Reset lại quota về mặc định (100 câu hỏi AI, 100 bác sĩ AI, 100 bản đồ, 100 thị trường) cho tất cả user gói TẬP SỰ
                      </Typography.Text>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        size="large"
                        loading={resetLoading}
                        onClick={handleResetApprenticeQuotas}
                        icon={<RefreshCw className="w-5 h-5" />}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {resetLoading ? 'Đang reset...' : 'Reset Quota'}
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {resetMessage && (
                  <Card 
                    className={`mt-4 ${resetMessage.includes('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <Typography.Text 
                      className={resetMessage.includes('✅') ? 'text-green-800' : 'text-red-800'}
                    >
                      {resetMessage}
                    </Typography.Text>
                  </Card>
                )}
              </Card>
            </div>
          )}

          {loading && <div className="text-center py-8">Đang tải...</div>}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <Card title={`Quản lý người dùng (${users.length})`}>
                <Table
                  columns={[
                    {
                      title: 'SĐT/Email',
                      key: 'contact',
                      render: (_, record) => record.phoneNumber || record.email,
                    },
                    {
                      title: 'Tên',
                      dataIndex: 'displayName',
                      key: 'displayName',
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'verificationStatus',
                      key: 'verificationStatus',
                      render: (status) => (
                        status === 'pending' ? (
                          <Tag color="orange">🕒 Chờ xác thực</Tag>
                        ) : (
                          <Tag color="green">✅ Đã xác thực</Tag>
                        )
                      ),
                    },
                    {
                      title: 'Uy tín',
                      dataIndex: 'reputation',
                      key: 'reputation',
                      render: (reputation) => reputation || 0,
                    },
                    {
                      title: 'Quyền',
                      dataIndex: 'role',
                      key: 'role',
                      render: (role, record) => (
                        <Select
                          value={role || 'user'}
                          onChange={(value) => updateUserRole(record.id, value)}
                          style={{ width: 120 }}
                        >
                          <Select.Option value="user">User</Select.Option>
                          <Select.Option value="moderator">Moderator</Select.Option>
                          <Select.Option value="admin">Admin</Select.Option>
                        </Select>
                      ),
                    },
                    {
                      title: 'Tham gia',
                      dataIndex: 'joinDate',
                      key: 'joinDate',
                      render: (date) => date?.toDate?.()?.toLocaleDateString() || 'N/A',
                    },
                    {
                      title: 'Hành động',
                      key: 'actions',
                      render: (_, record) => (
                        <Space>
                          {record.verificationStatus === 'pending' && (
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => verifyUser(record.id)}
                              className="bg-[#52c41a]"
                            >
                              Xác thực
                            </Button>
                          )}
                          <Popconfirm
                            title="Xác nhận xóa người dùng này?"
                            onConfirm={() => deleteUser(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button size="small" danger>Xóa</Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={users}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
                  }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <Card title={`Quản lý bài viết (${posts.length})`}>
                <Table
                  columns={[
                    {
                      title: 'Tiêu đề',
                      dataIndex: 'title',
                      key: 'title',
                      render: (title) => title?.substring(0, 50) + '...',
                    },
                    {
                      title: 'Tác giả',
                      dataIndex: 'authorName',
                      key: 'authorName',
                    },
                    {
                      title: 'Danh mục',
                      dataIndex: 'category',
                      key: 'category',
                      render: (category) => <Tag color="blue">{category}</Tag>,
                    },
                    {
                      title: 'Likes',
                      dataIndex: 'likes',
                      key: 'likes',
                      render: (likes) => likes || 0,
                    },
                    {
                      title: 'Ngày tạo',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date) => date?.toDate?.()?.toLocaleDateString() || 'N/A',
                    },
                    {
                      title: 'Hành động',
                      key: 'actions',
                      render: (_, record) => (
                        <Popconfirm
                          title="Xác nhận xóa bài viết này?"
                          onConfirm={() => deletePost(record.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button size="small" danger>Xóa</Button>
                        </Popconfirm>
                      ),
                    },
                  ]}
                  dataSource={posts}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài viết`,
                  }}
                  scroll={{ x: 800 }}
                />
              </Card>
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
              <Card title={`Quản lý sản phẩm (${products.length})`}>
                <Table
                  columns={[
                    {
                      title: 'Ảnh',
                      key: 'image',
                      width: 80,
                      render: (_, record) => (
                        <img 
                          src={record.imageUrls?.[0] || record.images?.[0] || 'https://via.placeholder.com/50'} 
                          alt={record.name}
                          className="w-12 h-12 object-cover rounded shadow-sm"
                        />
                      ),
                    },
                    {
                      title: 'Sản phẩm',
                      key: 'product',
                      render: (_, record) => (
                        <div>
                          <div className="font-medium text-gray-900">{record.name || record.productName}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{record.description}</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Giá & SL',
                      key: 'price',
                      render: (_, record) => (
                        <div>
                          <div className="text-sm font-bold text-green-600">
                            {new Intl.NumberFormat('vi-VN').format(record.price)}đ/{record.unit}
                          </div>
                          <div className="text-xs text-gray-500">Kho: {record.quantity || 0}</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Danh mục',
                      key: 'category',
                      render: (_, record) => (
                        <Tag color="blue">{record.category || record.productType}</Tag>
                      ),
                    },
                    {
                      title: 'Liên hệ',
                      key: 'contact',
                      render: (_, record) => (
                        <div>
                          <div className="text-sm font-medium">{record.supplier || record.sellerName}</div>
                          <div className="text-xs text-gray-500">{record.phone}</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Địa chỉ',
                      dataIndex: 'address',
                      key: 'address',
                      ellipsis: true,
                      width: 150,
                    },
                    {
                      title: 'Hành động',
                      key: 'actions',
                      render: (_, record) => (
                        <Popconfirm
                          title="Xác nhận xóa sản phẩm này khỏi chợ?"
                          onConfirm={async () => {
                            await deleteDoc(doc(db, 'marketplace_products', record.id));
                            setProducts(products.filter(p => p.id !== record.id));
                            message.success('Đã xóa sản phẩm');
                          }}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button size="small" danger>Xóa</Button>
                        </Popconfirm>
                      ),
                    },
                  ]}
                  dataSource={products.slice(0, 50)}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
                  }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </div>
          )}
          

          
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <Typography.Title level={2} className="text-[#795548] mb-6">
                Thống kê & Phân tích
              </Typography.Title>
              
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                  <Card>
                    <Typography.Title level={3} className="text-[#795548] mb-4">
                      Top 10 người dùng uy tín cao
                    </Typography.Title>
                    <div className="space-y-3">
                      {analytics.topUsers.map((u, idx) => (
                        <Card key={u.id} size="small" className="bg-gray-50">
                          <Row justify="space-between" align="middle">
                            <Col>
                              <Space>
                                <Tag color="green" className="text-lg font-bold">
                                  #{idx + 1}
                                </Tag>
                                <div>
                                  <Typography.Text strong className="text-gray-800">
                                    {u.displayName}
                                  </Typography.Text>
                                  <br />
                                  <Typography.Text type="secondary" className="text-sm">
                                    {u.email}
                                  </Typography.Text>
                                </div>
                              </Space>
                            </Col>
                            <Col>
                              <Typography.Text strong className="text-lg text-[#4CAF50]">
                                {u.reputation || 0}
                              </Typography.Text>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card>
                    <Typography.Title level={3} className="text-[#795548] mb-4">
                      Thao tác người dùng
                    </Typography.Title>
                    <div className="space-y-3">
                      {analytics.actionStats.map(stat => (
                        <Card key={stat.action} size="small" className="bg-gray-50">
                          <Row justify="space-between" align="middle">
                            <Col>
                              <Typography.Text strong className="text-gray-800">
                                {stat.action}
                              </Typography.Text>
                            </Col>
                            <Col>
                              <Tag color="green" className="font-bold">
                                {stat.count}
                              </Tag>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                  <Card>
                    <Typography.Title level={3} className="text-[#795548] mb-4">
                      Bài viết theo danh mục
                    </Typography.Title>
                    <div className="space-y-3">
                      {analytics.postsByCategory.map(cat => (
                        <Card key={cat.name} size="small" className="bg-gray-50">
                          <Row justify="space-between" align="middle">
                            <Col flex="auto">
                              <Typography.Text strong className="text-gray-800">
                                {cat.name}
                              </Typography.Text>
                            </Col>
                            <Col flex="200px">
                              <Progress 
                                percent={Math.round((cat.count / stats.totalPosts) * 100)} 
                                strokeColor="#4CAF50"
                                format={() => cat.count}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>

              <Card>
                <Typography.Title level={3} className="text-[#795548] mb-4">
                  Lịch sử thao tác gần đây
                </Typography.Title>
                <Table
                  columns={[
                    {
                      title: 'Thời gian',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      render: (timestamp) => timestamp?.toDate?.()?.toLocaleString() || 'N/A',
                    },
                    {
                      title: 'Người dùng',
                      dataIndex: 'userName',
                      key: 'userName',
                    },
                    {
                      title: 'Hành động',
                      dataIndex: 'action',
                      key: 'action',
                      render: (action) => (
                        <Tag color="green">{action}</Tag>
                      ),
                    },
                    {
                      title: 'Chi tiết',
                      dataIndex: 'details',
                      key: 'details',
                      render: (details) => JSON.stringify(details),
                      ellipsis: true,
                    },
                  ]}
                  dataSource={analytics.recentActivity}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hoạt động`,
                  }}
                  scroll={{ x: 600 }}
                />
              </Card>
            </div>
          )}
          
          {/* Post Creator Tab */}
          {activeTab === 'post-creator' && (
            <div>
              <AdminPostCreator />
            </div>
          )}
          
          {/* Version Manager Tab */}
          {activeTab === 'version' && (
            <div>
              <VersionManager />
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <Typography.Title level={2} className="text-[#795548] mb-4">
                Cài đặt
              </Typography.Title>
              <Card>
                <Typography.Text type="secondary">
                  Cài đặt hệ thống đang phát triển...
                </Typography.Text>
              </Card>
            </div>
          )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;