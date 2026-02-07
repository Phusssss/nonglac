import React from 'react';
import { Card, Typography, Modal, Tag, Button, Space } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ProductCard = ({ 
  product, 
  formatPrice, 
  user,
  onContactClick
}) => {
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [imageViewerOpen, setImageViewerOpen] = React.useState(false);

  const getProvince = (address) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || address;
  };

  const handleCardClick = () => {
    setDetailModalOpen(true);
  };

  const handleContactClick = (e) => {
    e.stopPropagation();
    onContactClick(product);
  };

  return (
    <>
      <Card
        hoverable
        style={{ 
          borderRadius: 8,
          cursor: 'pointer',
          border: '1px solid #f0f0f0'
        }}
        styles={{ body: { padding: 12 } }}
        onClick={handleCardClick}
        cover={
          <div style={{ 
            height: 160, 
            overflow: 'hidden',
            background: '#f8f8f8',
            position: 'relative'
          }}>
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                color: '#bbb'
              }}>
                🌾
              </div>
            )}
            
            {/* Multiple images indicator */}
            {product.images && product.images.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '3px 6px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 500
              }}>
                📷 {product.images.length}
              </div>
            )}

          </div>
        }
      >
        {/* Product Name */}
        <div style={{ 
          fontSize: 14,
          lineHeight: '18px',
          height: 36,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          marginBottom: 8,
          color: '#333'
        }}>
          {product.name}
        </div>

        {/* Price */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ 
            color: '#ee4d2d', 
            fontSize: 16,
            fontWeight: 600
          }}>
            {formatPrice(product.price)}
          </span>
          <span style={{ 
            color: '#757575',
            fontSize: 12,
            marginLeft: 2
          }}>
            /{product.unit || 'kg'}
          </span>
        </div>

        {/* Location */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: 8,
          minHeight: 16
        }}>
          <EnvironmentOutlined style={{ 
            fontSize: 11, 
            color: '#999', 
            marginRight: 4,
            flexShrink: 0
          }} />
          <Text style={{ 
            fontSize: 11,
            color: '#999',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {getProvince(product.address) || 'Việt Nam'}
          </Text>
        </div>

        {/* Bottom section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4
        }}>
          {/* Rating or sold count */}
          <div style={{ fontSize: 11, color: '#999' }}>
            {product.sold ? `Đã bán ${product.sold}` : 'Mới đăng'}
          </div>
          
          {/* Quick contact button */}
          <Button
            size="small"
            type="text"
            icon={user ? <PhoneOutlined /> : <UserOutlined />}
            onClick={handleContactClick}
            style={{
              fontSize: 10,
              height: 24,
              padding: '0 6px',
              color: '#52c41a'
            }}
          >
            {user ? 'Gọi' : 'Đăng nhập'}
          </Button>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={null}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={
          <Button
            type="primary"
            size="large"
            icon={user ? <PhoneOutlined /> : <UserOutlined />}
            onClick={() => onContactClick(product)}
            style={{
              background: '#52c41a',
              border: 'none',
              width: '100%',
              height: 48,
              fontSize: 16
            }}
          >
            {user ? 'Liên hệ người bán' : 'Đăng nhập để liên hệ'}
          </Button>
        }
        width={600}
        style={{ top: 20 }}
      >
        <div>
          {/* Images Gallery */}
          {product.images && product.images.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                style={{ 
                  width: '100%', 
                  maxHeight: 300, 
                  objectFit: 'cover',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
                onClick={() => setImageViewerOpen(true)}
              />
              
              {/* Multiple images indicator */}
              {product.images.length > 1 && (
                <div style={{ 
                  marginTop: 8,
                  display: 'flex',
                  gap: 4,
                  overflowX: 'auto'
                }}>
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 4,
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? '2px solid #52c41a' : '1px solid #f0f0f0'
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Info */}
          <div style={{ padding: '0 4px' }}>
            <h2 style={{ 
              fontSize: 20, 
              fontWeight: 600,
              marginBottom: 12,
              color: '#333'
            }}>
              {product.name}
            </h2>

            {/* Price */}
            <div style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              color: '#ee4d2d',
              marginBottom: 16
            }}>
              {formatPrice(product.price)}
              <span style={{ fontSize: 14, color: '#999', fontWeight: 400 }}>
                /{product.unit || 'kg'}
              </span>
            </div>

            {/* Product details */}
            <div style={{ 
              background: '#fafafa', 
              padding: 16, 
              borderRadius: 8,
              marginBottom: 16
            }}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <div>
                  <Text strong>Số lượng: </Text>
                  <Text>{product.quantity || 'Liên hệ'} {product.unit}</Text>
                </div>
                
                <div>
                  <Text strong>Người bán: </Text>
                  <Text>{product.supplier || 'Không rõ'}</Text>
                </div>

                {product.phone && (
                  <div>
                    <Text strong>Điện thoại: </Text>
                    <Text>{user ? product.phone : product.phone.replace(/.(?=.{4})/g, '*')}</Text>
                    {!user && <Text type="secondary"> (Đăng nhập để xem)</Text>}
                  </div>
                )}

                {product.address && (
                  <div>
                    <Text strong>Địa chỉ: </Text>
                    <Text>{product.address}</Text>
                  </div>
                )}
              </Space>
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16, marginBottom: 8, display: 'block' }}>
                  Mô tả sản phẩm
                </Text>
                <Text style={{ 
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.description}
                </Text>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        open={imageViewerOpen}
        onCancel={() => setImageViewerOpen(false)}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        styles={{
          body: { padding: 0, background: '#000' },
          content: { background: '#000' }
        }}
      >
        <div style={{ 
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh'
        }}>
          <img
            src={product.images[selectedImageIndex]}
            alt={product.name}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain'
            }}
          />
        </div>
        
        {/* Image navigation */}
        {product.images.length > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            padding: 16,
            background: '#000'
          }}>
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} ${index + 1}`}
                style={{
                  width: 50,
                  height: 50,
                  objectFit: 'cover',
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: selectedImageIndex === index ? '2px solid #52c41a' : '1px solid #666',
                  opacity: selectedImageIndex === index ? 1 : 0.6
                }}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProductCard;