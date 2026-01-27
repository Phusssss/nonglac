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
            onClick={onContactClick}
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
            onClick={onShare}
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
  );
};

export default ProductInfo;