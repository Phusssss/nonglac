import React from 'react';
import { Card, Button, Tag, Typography, Badge, Tooltip } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
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
  const isMobile = window.innerWidth < 768;
  
  const maskPhone = (phone) => {
    if (!phone) return '';
    if (user) return phone;
    return phone.replace(/.(?=.{4})/g, '*');
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.image-container') || e.target.closest('.contact-button')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };
  return (
    <Card
      hoverable
      className="marketplace-product-card"
      onClick={handleCardClick}
      style={{ 
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
      cover={
        <div 
          className="image-container"
          style={{ height: isMobile ? 180 : 200, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
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
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {product.images.length > 1 && (
                <Badge 
                  count={`+${product.images.length - 1}`} 
                  style={{ 
                    position: 'absolute', 
                    bottom: 8, 
                    left: 8,
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white'
                  }} 
                />
              )}
            </>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48
            }}>
              📸
            </div>
          )}
          <div style={{ position: 'absolute', top: isMobile ? 8 : 12, right: isMobile ? 8 : 12, fontSize: isMobile ? 16 : 20 }}>
            <span className="trust-score-icon">{getTrustScoreIcon(product.trustScore)}</span>
          </div>
          <div 
            className="image-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s'
            }}
          >
            <EyeOutlined style={{ fontSize: isMobile ? 20 : 24, color: 'white' }} />
          </div>
        </div>
      }
      actions={user ? [
        <Button 
          type="primary" 
          onClick={() => onContactClick(product)}
          style={{
            background: 'linear-gradient(135deg, #52c41a, #389e0d)',
            border: 'none',
            borderRadius: 6
          }}
        >
          Liên hệ
        </Button>
      ] : []}
    >
      <Card.Meta
        title={
          <div style={{ marginBottom: isMobile ? 6 : 8 }}>
            <Title level={5} style={{ margin: 0, color: '#262626', fontSize: isMobile ? 14 : 16 }}>
              {product.name}
            </Title>
            <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
              {product.supplier}
            </Text>
          </div>
        }
        description={
          <div>
            {/* Product Description */}
            {product.description && (
              <div style={{ marginBottom: isMobile ? 6 : 8 }}>
                <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                  {product.description.length > (isMobile ? 60 : 80) 
                    ? `${product.description.substring(0, isMobile ? 60 : 80)}...` 
                    : product.description
                  }
                </Text>
              </div>
            )}
            
            {/* Seller Info */}
            <div className="seller-info-box" style={{ marginBottom: isMobile ? 6 : 8, padding: isMobile ? '4px 6px' : '6px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: isMobile ? 11 : 12, color: '#52c41a' }}>👤 {product.supplier || 'Người bán'}</Text>
                  {product.phone && (
                    <div>
                      <Text type="secondary" style={{ fontSize: isMobile ? 10 : 11 }}>📞 {maskPhone(product.phone)}</Text>
                      {!user && <Text className="login-prompt" style={{ fontSize: isMobile ? 9 : 10, marginLeft: 4 }}>(Đăng nhập để xem đầy đủ)</Text>}
                    </div>
                  )}
                </div>
                {product.address && (
                  <Tooltip title={product.address}>
                    <Tag icon={<EnvironmentOutlined />} color="blue" style={{ fontSize: isMobile ? 9 : 10, margin: 0, marginTop: isMobile ? 4 : 0 }}>
                      {product.address.length > (isMobile ? 10 : 15) ? `${product.address.substring(0, isMobile ? 10 : 15)}...` : product.address}
                    </Tag>
                  </Tooltip>
                )}
              </div>
            </div>
            
            {/* Stock and Availability */}
            {(product.quantity || product.stockStatus) && (
              <div style={{ marginBottom: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
                {product.quantity && (
                  <Tag color="cyan" className="stock-indicator" style={{ fontSize: 11, margin: 0 }}>
                    📦 Còn {product.quantity} {product.unit}
                  </Tag>
                )}
                {product.stockStatus && (
                  <Tag 
                    className="stock-indicator"
                    color={product.stockStatus === 'in_stock' ? 'green' : product.stockStatus === 'pre_order' ? 'orange' : 'red'} 
                    style={{ fontSize: 11, margin: 0 }}
                  >
                    {product.stockStatus === 'in_stock' ? '✅ Có sẵn' : 
                     product.stockStatus === 'pre_order' ? '⏳ Đặt trước' : '🚚 Đang vận chuyển'}
                  </Tag>
                )}
              </div>
            )}
            
            {/* Location and Date */}
            <div style={{ marginBottom: 8, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {product.location && (
                  <Tooltip title="Địa điểm">
                    <Tag icon={<EnvironmentOutlined />} color="geekblue" style={{ fontSize: 11, margin: 0 }}>
                      {product.location}
                    </Tag>
                  </Tooltip>
                )}
                {product.createdAt && (
                  <Tooltip title="Ngày đăng">
                    <Tag icon={<CalendarOutlined />} color="default" style={{ fontSize: 11, margin: 0 }}>
                      {formatDate(product.createdAt)}
                    </Tag>
                  </Tooltip>
                )}
              </div>
              {product.userRole && (
                <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>
                  {product.userRole === 'farmer' ? '🌾 Nông dân' :
                   product.userRole === 'trader' ? '🏪 Thương lái' :
                   product.userRole === 'wholesaler' ? '📦 Bán sỉ' : '👤 Người bán'}
                </Tag>
              )}
            </div>
            
            {/* Certifications and Features */}
            <div style={{ marginBottom: 12 }}>
              {product.certification && product.certification.length > 0 && (
                <div style={{ marginBottom: 4 }}>
                  {product.certification.map((cert, index) => (
                    <Tag key={index} color="green" className="product-tag" style={{ marginRight: 4, marginBottom: 2, fontSize: 10 }}>
                      ✓ {cert}
                    </Tag>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {product.packaging && (
                  <Tag color="blue" className="product-tag" style={{ fontSize: 10, margin: 0 }}>
                    📦 {product.packaging}
                  </Tag>
                )}
                {product.organic && (
                  <Tag color="green" className="product-tag" style={{ fontSize: 10, margin: 0 }}>
                    🌱 Hữu cơ
                  </Tag>
                )}
                {product.freshness && (
                  <Tag color="orange" className="product-tag" style={{ fontSize: 10, margin: 0 }}>
                    ⏰ {product.freshness}
                  </Tag>
                )}
                {product.traceability && product.traceability.length > 0 && (
                  <Tag color="purple" className="product-tag" style={{ fontSize: 10, margin: 0 }}>
                    🔍 Truy xuất nguồn gốc
                  </Tag>
                )}
              </div>
            </div>
            
            {/* Price and Quantity */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? 8 : 0 }}>
              <div style={{ flex: 1 }}>
                <Text strong className="product-price" style={{ fontSize: isMobile ? 16 : 18 }}>
                  {formatPrice(product.price)}
                </Text>
                <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>/{product.unit}</Text>
                {product.transactionIntent && (
                  <div>
                    <Tag 
                      color={product.transactionIntent === 'b2b' ? 'gold' : product.transactionIntent === 'export' ? 'red' : 'default'} 
                      style={{ fontSize: isMobile ? 8 : 9, marginTop: 2 }}
                    >
                      {product.transactionIntent === 'b2b' ? '💼 Bán buôn' :
                       product.transactionIntent === 'export' ? '🌍 Xuất khẩu' : '🛒 Bán lẻ'}
                    </Tag>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 8 : 0 }}>
                {!user && (
                  <div className="login-prompt" style={{ marginBottom: 4, padding: '2px 6px' }}>
                    <Text type="secondary" style={{ fontSize: isMobile ? 9 : 10 }}>🔒 Đăng nhập để xem đầy đủ</Text>
                  </div>
                )}
                <Button 
                  type="primary" 
                  size={isMobile ? 'small' : 'small'}
                  className="contact-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContactClick(product);
                  }}
                  style={{
                    background: user ? 'linear-gradient(135deg, #52c41a, #389e0d)' : 'linear-gradient(135deg, #ffa940, #fa8c16)',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: isMobile ? 11 : 12,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  {user ? '💬 Liên hệ' : '🔓 Đăng nhập'}
                </Button>
              </div>
            </div>
          </div>
        }
      />

    </Card>
  );
};

export default ProductCard;