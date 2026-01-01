import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Drawer, Spin, Empty, Tag, Typography, Row, Col, Badge, Tooltip } from 'antd';
import { FilterOutlined, PlusOutlined, EnvironmentOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import FilterPanel from '../filters/FilterPanel';
import ProductPostForm from './ProductPostForm';
import ProductCard from './ProductCard';
import ProductImageGallery from './ProductImageGallery';
import ContactModal from './ContactModal';
import filterService from '../../services/filterService';
import imageUploadService from '../../services/imageUploadService';
import './marketplace.css';

const { Title, Text } = Typography;



const MarketplaceWithFilters = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState('farmer');
  const [transactionIntent, setTransactionIntent] = useState('b2b');
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'marketplace_products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      

      
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleFiltersChange = (newFilters) => {
    setActiveFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filters) => {
    const filtered = filterService.applyContextualFilters(
      products,
      userRole,
      transactionIntent,
      filters
    );
    setFilteredProducts(filtered);
  };

  const handleProductSubmit = async (productData) => {
    if (!user) {
      alert('Vui lòng đăng nhập để đăng sản phẩm');
      return;
    }

    try {
      console.log('Product data received:', productData);
      console.log('Images to save:', productData.imageUrls);
      
      const newProduct = {
        ...productData,
        ...productData.productAttributes,
        ...productData.contactInfo,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: productData.imageUrls || [] // Đảm bảo images được lưu đúng
      };
      
      console.log('Final product to save:', newProduct);
      
      const productsRef = collection(db, 'marketplace_products');
      const docRef = await addDoc(productsRef, newProduct);
      
      console.log('Product saved with ID:', docRef.id);
      
      await loadProducts();
      setPostFormOpen(false);
      alert('Đăng sản phẩm thành công!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Có lỗi xảy ra khi đăng sản phẩm: ' + error.message);
    }
  };

  const getTrustScoreIcon = (score) => {
    switch (score) {
      case 'diamond': return '💎';
      case 'gold': return '🥇';
      case 'verified': return '✅';
      default: return '⭐';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleImageClick = (product) => {
    setSelectedProduct(product);
    setImageGalleryOpen(true);
  };

  const handleContactClick = async (product) => {
    if (!user) {
      alert('Vui lòng đăng nhập để xem thông tin liên hệ!');
      return;
    }
    
    try {
      // Get seller info from users collection
      const userDoc = await getDoc(doc(db, 'users', product.userId));
      const sellerData = userDoc.exists() ? userDoc.data() : {};
      
      setSelectedProduct(product);
      setSelectedSeller({
        id: product.userId,
        name: sellerData.displayName || product.userEmail,
        email: product.userEmail,
        phone: sellerData.phone || product.phone,
        ...sellerData
      });
      setContactModalOpen(true);
    } catch (error) {
      console.error('Error getting seller info:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN');
  };



  return (
    <Layout className="marketplace-container">
      {/* Hero Header */}
      <div className="marketplace-hero" style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 12px' : '24px' }}>
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col xs={24} md={16} style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ 
                  width: isMobile ? 40 : 48, 
                  height: isMobile ? 40 : 48, 
                  background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? 20 : 24,
                  marginRight: 16,
                  flexShrink: 0
                }}>
                  🌾
                </div>
                <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <Title level={isMobile ? 3 : 2} style={{ margin: 0, color: '#262626' }}>
                    Chợ Nông Lạc
                  </Title>
                  <Text type="secondary" style={{ fontSize: isMobile ? 14 : 16 }}>
                    Nơi kết nối nông dân và thương gia
                  </Text>
                </div>
              </div>
              <div style={{ display: 'flex', gap: isMobile ? 8 : 16, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <Tag color="green" style={{ fontSize: isMobile ? 10 : 12 }}>Thông minh</Tag>
                <Tag color="blue" style={{ fontSize: isMobile ? 10 : 12 }}>Chất lượng</Tag>
                <Tag color="orange" style={{ fontSize: isMobile ? 10 : 12 }}>An toàn</Tag>
              </div>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size={isMobile ? 'middle' : 'large'}
                icon={<PlusOutlined />}
                onClick={() => {
                  if (!user) {
                    alert('Vui lòng đăng nhập để đăng sản phẩm');
                    return;
                  }
                  setPostFormOpen(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                  border: 'none',
                  borderRadius: 8,
                  height: isMobile ? 40 : 48,
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 600,
                  width: isMobile ? '100%' : 'auto',
                  maxWidth: isMobile ? '280px' : 'none'
                }}
              >
                Đăng bán sản phẩm
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Content */}
      <div className="marketplace-main-content" style={{ 
        display: 'flex', 
        gap: isMobile ? 16 : 24, 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: isMobile ? '16px 12px' : '24px',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Filter Sidebar */}
        {!isMobile && (
          <div style={{ width: 360, flexShrink: 0 }}>
            <div className="filter-panel-sticky" style={{ 
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                padding: '20px 24px'
              }}>
                <Title level={4} style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center' }}>
                  <FilterOutlined style={{ marginRight: 8 }} />
                  Bộ lọc sản phẩm
                </Title>
              </div>
              <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <FilterPanel
                  onFiltersChange={handleFiltersChange}
                  userRole={userRole}
                  transactionIntent={transactionIntent}
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Content */}
        <div style={{ flex: 1 }}>
          {isMobile && (
            <Button
              block
              size="large"
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerOpen(true)}
              className="marketplace-filter-button"
              style={{
                borderColor: '#52c41a',
                color: '#52c41a'
              }}
            >
              Mở bộ lọc sản phẩm
            </Button>
          )}

          {loading ? (
            <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
              {[...Array(6)].map((_, index) => (
                <Col xs={24} sm={12} md={8} lg={8} xl={6} key={index}>
                  <Card loading style={{ borderRadius: 12, height: isMobile ? 280 : 320 }}>
                    <Card.Meta />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]} className="marketplace-grid">
              {filteredProducts.map(product => (
                <Col xs={24} sm={12} md={8} lg={8} xl={6} key={product.id}>
                  <ProductCard
                    product={product}
                    onImageClick={handleImageClick}
                    onContactClick={handleContactClick}
                    getTrustScoreIcon={getTrustScoreIcon}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                    user={user}
                  />
                </Col>
              ))}
            </Row>
          )}

          {!loading && filteredProducts.length === 0 && (
            <Empty
              image={<div style={{ fontSize: 64 }}>🌱</div>}
              imageStyle={{ height: 100 }}
              description={
                <div>
                  <Title level={4}>Chưa có sản phẩm nào</Title>
                  <Text type="secondary">
                    Hãy là người đầu tiên chia sẻ sản phẩm nông nghiệp của bạn!
                  </Text>
                </div>
              }
            >
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => {
                  if (!user) {
                    alert('Vui lòng đăng nhập để đăng sản phẩm');
                    return;
                  }
                  setPostFormOpen(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                  border: 'none',
                  borderRadius: 8
                }}
              >
                Đăng sản phẩm đầu tiên
              </Button>
            </Empty>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Bộ lọc sản phẩm"
        placement="right"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        width={320}
      >
        <FilterPanel
          onFiltersChange={handleFiltersChange}
          userRole={userRole}
          transactionIntent={transactionIntent}
        />
      </Drawer>

      {/* Product Form Modal */}
      <Drawer
        title="Đăng sản phẩm mới"
        placement="right"
        onClose={() => setPostFormOpen(false)}
        open={postFormOpen}
        width={isMobile ? '100%' : 600}
        style={{ maxHeight: '100vh' }}
        bodyStyle={{ padding: 0, height: 'calc(100vh - 55px)', overflow: 'auto' }}
      >
        <ProductPostForm
          onSubmit={handleProductSubmit}
          onCancel={() => setPostFormOpen(false)}
        />
      </Drawer>

      {/* Image Gallery Modal */}
      <ProductImageGallery
        images={selectedProduct?.images || []}
        visible={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        productName={selectedProduct?.name || ''}
      />

      {/* Contact Modal */}
      <ContactModal
        visible={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        product={selectedProduct}
        seller={selectedSeller}
      />
    </Layout>
  );
};

export default MarketplaceWithFilters;