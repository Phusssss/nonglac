import React from 'react';
import { Card, Button, Tag, Typography, Badge, Tooltip, Space } from 'antd';
import { 
  EnvironmentOutlined, 
  CalendarOutlined, 
  EyeOutlined, 
  PhoneOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './marketplace.css';

const { Text, Title } = Typography;

const ProductCard = ({ 
  product, 
  onImageClick, 
  onContactClick, 
  getTrustScoreIcon, 
  formatPrice, 
  formatDate,
  user
}) => {
  const navigate = useNavigate();
  
  const maskPhone = (phone) => {
    if (!phone) return '';
    if (user) return phone;
    return phone.replace(/.(?=.{4})/g, '*');
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.ant-card-actions') || e.target.closest('.contact-button')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  return (
    <Card
      hoverable
      style={{ 
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        height: '100%',
        border: '1px solid #f0f0f0'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(82, 196, 26, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
      }}
      onClick={handleCardClick}
      cover={
        <div 
          style={{ 
            height: 220, 
            position: 'relative', 
            overflow: 'hidden',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #f6ffed, #d9f7be)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onImageClick(product);
          }}
        >
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[0]}
                alt={product.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              />
              {product.images.length > 1 && (
                <Badge 
                  count={`+${product.images.length - 1}`} 
                  style={{ 
                    position: 'absolute', 
                    bottom: 12, 
                    left: 12,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    fontSize: 11
                  }} 
                />
              )}
            </>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              color: '#52c41a'
            }}>
              🌾
            </div>
          )}
          
          {/* Trust Score Badge */}
          <div style={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            {getTrustScoreIcon(product.trustScore)}
          </div>

          {/* Price Badge */}
          <div style={{ 
            position: 'absolute', 
            bottom: 12, 
            right: 12,
            background: 'linear-gradient(135deg, #52c41a, #389e0d)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
          }}>
            {formatPrice(product.price)}
          </div>

          {/* Hover Overlay */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(82, 196, 26, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
            className="image-overlay"
          >
            <EyeOutlined style={{ fontSize: 28, color: '#52c41a' }} />
          </div>
        </div>
      }
      actions={[
        <Tooltip title={user ? "Liên hệ người bán" : "Đăng nhập để liên hệ"}>
          <Button 
            type="primary"
            icon={user ? <PhoneOutlined /> : <UserOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onContactClick(product);
            }}
            style={{
              background: user ? 
                'linear-gradient(135deg, #52c41a, #389e0d)' : 
                'linear-gradient(135deg, #1890ff, #096dd9)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 500,
              height: 36
            }}
            className="contact-button"
            block
          >
            {user ? 'Liên hệ ngay' : 'Đăng nhập'}
          </Button>
        </Tooltip>
      ]}
    >
      <div style={{ padding: '8px 0' }}>
        {/* Product Title */}
        <Title level={5} style={{ 
          margin: 0, 
          marginBottom: 8,
          color: '#262626',
          fontSize: 16,
          lineHeight: 1.3,
          height: 42,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.name}
        </Title>

        {/* Seller Info */}
        <div style={{ 
          marginBottom: 12,
          padding: 12,
          background: '#f6ffed',
          borderRadius: 8,
          border: '1px solid #d9f7be'
        }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space size={6}>
                <ShopOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                <Text strong style={{ fontSize: 13, color: '#52c41a' }}>
                  {product.supplier || 'Người bán'}
                </Text>
              </Space>
            </div>
            
            {product.phone && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ color: '#52c41a', fontSize: 12, marginRight: 6 }} />
                <Text style={{ fontSize: 12 }}>
                  {maskPhone(product.phone)}
                </Text>
                {!user && (
                  <Text type="secondary" style={{ fontSize: 10, marginLeft: 4 }}>
                    (Đăng nhập để xem)
                  </Text>
                )}
              </div>
            )}
            
            {product.address && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ color: '#52c41a', fontSize: 12, marginRight: 6 }} />
                <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: product.address }}>
                  {product.address}
                </Text>
              </div>
            )}
          </Space>
        </div>

        {/* Product Description */}
        {product.description && (
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ 
              fontSize: 13,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {product.description}
            </Text>
          </div>
        )}

        {/* Bottom Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text style={{ fontSize: 12, color: '#52c41a' }}>
              📦 {product.quantity || 'Liên hệ'} {product.unit}
            </Text>
          </div>
          {product.createdAt && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatDate(product.createdAt)}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;