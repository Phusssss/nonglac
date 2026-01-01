import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { Layout, Card, Button, Tag, Typography, Row, Col, Divider, Tabs, Rate, Avatar, Tooltip, Carousel } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, ShareAltOutlined, PhoneOutlined, EnvironmentOutlined, UserOutlined, CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import ContactModal from '../components/marketplace/ContactModal';
import ProductImageGallery from '../components/marketplace/ProductImageGallery';
import './ProductDetail.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const carouselRef = React.useRef();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, 'marketplace_products', id));
      
      if (productDoc.exists()) {
        const productData = { id: productDoc.id, ...productDoc.data() };
        setProduct(productData);
        
        // Load seller info
        if (productData.userId) {
          const sellerDoc = await getDoc(doc(db, 'users', productData.userId));
          if (sellerDoc.exists()) {
            setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
          }
        }
        
        // Load related products
        const relatedQuery = query(
          collection(db, 'marketplace_products'),
          where('category', '==', productData.category),
          limit(4)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        const related = relatedSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id);
        setRelatedProducts(related);
      } else {
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  const handleContactClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để xem thông tin liên hệ!');
      return;
    }
    setContactModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
          <Card loading style={{ marginBottom: 24 }}>
            <Card.Meta />
          </Card>
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/marketplace')}
          style={{ marginBottom: 24 }}
        >
          Quay lại chợ
        </Button>

        <Row gutter={[24, 24]}>
          {/* Product Images */}
          <Col xs={24} lg={12}>
            <Card style={{ marginBottom: 16 }}>
              {product.images && product.images.length > 0 ? (
                <div className="product-detail-carousel" style={{ position: 'relative' }}>
                  <Carousel 
                    ref={carouselRef}
                    dots={true}
                    infinite={true}
                    autoplay={false}
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                    dotPosition="bottom"
                  >
                    {product.images.map((image, index) => (
                      <div key={index}>
                        <div 
                          style={{ 
                            height: 400, 
                            background: '#f0f0f0',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() => setImageGalleryOpen(true)}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              borderRadius: 8
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 12,
                            fontSize: 12
                          }}>
                            {index + 1}/{product.images.length}
                          </div>
                        </div>
                      </div>
                    ))}
                  </Carousel>
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => carouselRef.current?.prev()}
                        className="carousel-nav-btn"
                        style={{
                          position: 'absolute',
                          left: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          zIndex: 10
                        }}
                      />
                      <Button
                        type="text"
                        icon={<RightOutlined />}
                        onClick={() => carouselRef.current?.next()}
                        className="carousel-nav-btn"
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          zIndex: 10
                        }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div style={{ 
                  height: 400, 
                  background: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 48,
                  borderRadius: 8
                }}>
                  📷
                </div>
              )}
              
              {/* Click to view all images hint */}
              {product.images && product.images.length > 1 && (
                <div 
                  className="gallery-hint"
                  style={{ 
                    textAlign: 'center', 
                    marginTop: 12, 
                    padding: '8px 12px',
                    background: '#f0f0f0',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }} 
                  onClick={() => setImageGalleryOpen(true)}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    👁️ Click để xem tất cả {product.images.length} hình ảnh
                  </Text>
                </div>
              )}
            </Card>
          </Col>

          {/* Product Info */}
          <Col xs={24} lg={12}>
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0, color: '#262626' }}>
                  {product.name}
                </Title>
                <Text type="secondary">
                  Bán bởi {product.supplier || seller?.displayName || product.userEmail}
                </Text>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Title level={1} style={{ color: '#52c41a', margin: 0 }}>
                  {formatPrice(product.price)}
                  <Text style={{ fontSize: 16, color: '#666', fontWeight: 'normal' }}>/{product.unit}</Text>
                </Title>
              </div>

              {/* Product Tags */}
              <div style={{ marginBottom: 16 }}>
                {product.certification && product.certification.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    {product.certification.map((cert, index) => (
                      <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                        ✓ {cert}
                      </Tag>
                    ))}
                  </div>
                )}
                
                <div>
                  {product.organic && (
                    <Tag color="green">🌱 Hữu cơ</Tag>
                  )}
                  {product.packaging && (
                    <Tag color="blue">📦 {product.packaging}</Tag>
                  )}
                  {product.freshness && (
                    <Tag color="orange">⏰ {product.freshness}</Tag>
                  )}
                  {product.stockStatus && (
                    <Tag color={product.stockStatus === 'in_stock' ? 'green' : 'orange'}>
                      {product.stockStatus === 'in_stock' ? '✅ Có sẵn' : '⏳ Đặt trước'}
                    </Tag>
                  )}
                </div>
              </div>

              {/* Quantity Available */}
              {product.quantity && (
                <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f6ffed', borderRadius: 8 }}>
                  <Text strong style={{ color: '#52c41a' }}>
                    📦 Còn lại: {product.quantity} {product.unit}
                  </Text>
                </div>
              )}

              {/* Action Buttons */}
              <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    onClick={handleContactClick}
                    style={{
                      background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                      border: 'none',
                      height: 48
                    }}
                  >
                    💬 Liên hệ người bán
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    icon={<HeartOutlined />} 
                    block
                  >
                    Yêu thích
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    icon={<ShareAltOutlined />} 
                    onClick={handleShare}
                    block
                  >
                    Chia sẻ
                  </Button>
                </Col>
              </Row>

              {/* Seller Info */}
              <Card size="small" style={{ background: '#f6ffed' }}>
                <Title level={5} style={{ margin: '0 0 12px 0' }}>
                  👤 Thông tin người bán
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
                  <div>
                    <Text strong>{product.supplier || seller?.displayName || 'Người bán'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {product.userRole === 'farmer' ? '🌾 Nông dân' :
                       product.userRole === 'trader' ? '🏪 Thương lái' : '👤 Người bán'}
                    </Text>
                  </div>
                </div>
                
                {product.location && (
                  <div style={{ marginBottom: 4 }}>
                    <EnvironmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    <Text>{product.location}</Text>
                  </div>
                )}
                
                {product.createdAt && (
                  <div>
                    <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    <Text type="secondary">Ngày đăng: {formatDate(product.createdAt)}</Text>
                  </div>
                )}
              </Card>
            </Card>
          </Col>
        </Row>

        {/* Product Details Tabs */}
        <Card style={{ marginTop: 24 }}>
          <Tabs defaultActiveKey="description">
            <TabPane tab="Mô tả sản phẩm" key="description">
              <div style={{ padding: '16px 0' }}>
                <Paragraph>{product.description}</Paragraph>
                
                <Title level={5}>Thông tin chi tiết:</Title>
                <ul style={{ paddingLeft: 20 }}>
                  <li>Danh mục: {product.category}</li>
                  {product.quantity && <li>Số lượng: {product.quantity} {product.unit}</li>}
                  {product.location && <li>Xuất xứ: {product.location}</li>}
                  {product.transactionIntent && (
                    <li>Loại giao dịch: {
                      product.transactionIntent === 'b2b' ? 'Bán buôn' :
                      product.transactionIntent === 'export' ? 'Xuất khẩu' : 'Bán lẻ'
                    }</li>
                  )}
                </ul>
              </div>
            </TabPane>
            
            <TabPane tab="Thông số kỹ thuật" key="specifications">
              <div style={{ padding: '16px 0' }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}><Text strong>Tên sản phẩm:</Text></Col>
                  <Col span={16}><Text>{product.name}</Text></Col>
                  
                  <Col span={8}><Text strong>Danh mục:</Text></Col>
                  <Col span={16}><Text>{product.category}</Text></Col>
                  
                  <Col span={8}><Text strong>Giá:</Text></Col>
                  <Col span={16}><Text>{formatPrice(product.price)}/{product.unit}</Text></Col>
                  
                  {product.quantity && (
                    <>
                      <Col span={8}><Text strong>Số lượng:</Text></Col>
                      <Col span={16}><Text>{product.quantity} {product.unit}</Text></Col>
                    </>
                  )}
                  
                  {product.location && (
                    <>
                      <Col span={8}><Text strong>Vị trí:</Text></Col>
                      <Col span={16}><Text>{product.location}</Text></Col>
                    </>
                  )}
                  
                  <Col span={8}><Text strong>Ngày đăng:</Text></Col>
                  <Col span={16}><Text>{formatDate(product.createdAt)}</Text></Col>
                </Row>
              </div>
            </TabPane>
            
            <TabPane tab="Đánh giá" key="reviews">
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                Chưa có đánh giá nào
              </div>
            </TabPane>
          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Card style={{ marginTop: 24 }}>
            <Title level={3} style={{ marginBottom: 24 }}>Sản phẩm liên quan</Title>
            <Row gutter={[16, 16]}>
              {relatedProducts.map((relatedProduct) => (
                <Col xs={12} sm={8} md={6} key={relatedProduct.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                    cover={
                      <div style={{ height: 150, overflow: 'hidden' }}>
                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                          <img
                            src={relatedProduct.images[0]}
                            alt={relatedProduct.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32
                          }}>
                            📷
                          </div>
                        )}
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <Text ellipsis style={{ fontSize: 14 }}>
                          {relatedProduct.name}
                        </Text>
                      }
                      description={
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {relatedProduct.supplier}
                          </Text>
                          <br />
                          <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
                            {formatPrice(relatedProduct.price)}
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>

      {/* Contact Modal */}
      <ContactModal
        visible={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        product={product}
        seller={{
          id: product?.userId,
          name: seller?.displayName || product?.supplier,
          email: product?.userEmail,
          phone: seller?.phone || product?.phone,
          ...seller
        }}
      />

      {/* Image Gallery Modal */}
      <ProductImageGallery
        images={product?.images || []}
        visible={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        productName={product?.name || ''}
      />
    </Layout>
  );
};

export default ProductDetail;
