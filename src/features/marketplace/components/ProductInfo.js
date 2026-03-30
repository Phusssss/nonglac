import React from 'react';
import { Card, Button, Tag, Typography, Row, Col, Avatar } from 'antd';
import { HeartOutlined, ShareAltOutlined, EnvironmentOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProductInfo = ({ product, seller, onContactClick, onShare }) => {
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

  return (
    <Card className="elegant-detail-card">
      <div style={{ marginBottom: 20 }}>
        <Title level={2} className="elegant-title" style={{ margin: 0 }}>
          {product.name}
        </Title>
        <Text type="secondary">
          Bán bởi {product.supplier || seller?.displayName || product.userEmail}
        </Text>
      </div>

      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
        <Title level={1} className="elegant-price" style={{ margin: 0 }}>
          {formatPrice(product.price)}
          <Text style={{ fontSize: 16, color: '#64748b', fontWeight: 500, marginLeft: 4 }}>/{product.unit}</Text>
        </Title>
      </div>

      {/* Product Tags */}
      <div style={{ marginBottom: 24 }}>
        {product.certification && product.certification.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {product.certification.map((cert, index) => (
              <Tag key={index} className="elegant-tag elegant-tag-success" style={{ marginBottom: 8, padding: '2px 12px' }}>
                ✓ {cert}
              </Tag>
            ))}
          </div>
        )}
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {product.organic && (
            <Tag className="elegant-tag elegant-tag-success">🌱 Hữu cơ</Tag>
          )}
          {product.packaging && (
            <Tag className="elegant-tag">📦 {product.packaging}</Tag>
          )}
          {product.freshness && (
            <Tag className="elegant-tag elegant-tag-warning">⏰ {product.freshness}</Tag>
          )}
          {product.stockStatus && (
            <Tag className={`elegant-tag ${product.stockStatus === 'in_stock' ? 'elegant-tag-success' : 'elegant-tag-warning'}`}>
              {product.stockStatus === 'in_stock' ? '✅ Có sẵn' : '⏳ Đặt trước'}
            </Tag>
          )}
        </div>
      </div>

      {/* Quantity Available */}
      {product.quantity && (
        <div style={{ marginBottom: 24, padding: '12px 20px', background: '#f8fafc', borderLeft: '4px solid #b45309', borderRadius: '0 8px 8px 0' }}>
          <Text strong style={{ color: '#475569', fontSize: 15 }}>
            📦 Số lượng kho: <span style={{ color: '#b45309', fontWeight: 700 }}>{product.quantity} {product.unit}</span>
          </Text>
        </div>
      )}

      {/* Action Buttons */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Button 
            type="primary" 
            size="large" 
            block
            onClick={onContactClick}
            className="elegant-button-primary"
            style={{ height: 50, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            💬 Liên hệ ngay
          </Button>
        </Col>
        <Col span={12}>
          <Button 
            icon={<HeartOutlined />} 
            block
            size="large"
            className="elegant-button-secondary"
          >
            Yêu thích
          </Button>
        </Col>
        <Col span={12}>
          <Button 
            icon={<ShareAltOutlined />} 
            onClick={onShare}
            block
            size="large"
            className="elegant-button-secondary"
          >
            Chia sẻ
          </Button>
        </Col>
      </Row>

      {/* Seller Info */}
      <div className="elegant-seller-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Avatar size={48} icon={<UserOutlined />} style={{ marginRight: 16, background: '#15803d' }} />
          <div>
            <Text strong style={{ fontSize: 16, color: '#1e293b' }}>{product.supplier || seller?.displayName || 'Nhà cung cấp ẩn danh'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 13, color: '#64748b' }}>
              {product.userRole === 'farmer' ? '🌾 Đối tác Nông dân' :
               product.userRole === 'trader' ? '🏪 Nhà nhập khẩu/phân phối' : '👤 Đối tác bán hàng'}
            </Text>
          </div>
        </div>
        
        {product.location && (
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ marginRight: 10, color: '#15803d', fontSize: 16 }} />
            <Text style={{ color: '#475569' }}>{product.location}</Text>
          </div>
        )}
        
        {product.createdAt && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: 10, color: '#15803d', fontSize: 16 }} />
            <Text style={{ color: '#475569' }}>Đăng ngày: {formatDate(product.createdAt)}</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductInfo;