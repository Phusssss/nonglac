import React, { memo } from 'react';
import { Card, Button } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { marketplaceService } from '../services';

const ProductCard = ({
  product,
  user,
  onContactClick,
  onProductClick,
  onPreviewImages
}) => {
  const getProvince = (address) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || address;
  };

  const handleContactClick = (e) => {
    e.stopPropagation();
    onContactClick(product);
  };

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    if (onPreviewImages) onPreviewImages(product);
  };

  return (
    <Card
      hoverable
      className="marketplace-product-card"
      styles={{ body: { padding: 12 } }}
      onClick={() => onProductClick(product)}
      cover={(
        <div className="marketplace-product-cover">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="marketplace-product-image"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="marketplace-product-fallback">🌿</div>
          )}

          <div className="marketplace-product-badges">
            <span className="marketplace-badge-category">{product.category || 'Nông sản'}</span>
            {product.images && product.images.length > 1 && (
              <button type="button" className="marketplace-badge-images" onClick={handlePreviewClick}>
                {product.images.length} ảnh
              </button>
            )}
          </div>
        </div>
      )}
    >
      <div className="marketplace-product-title">{product.name}</div>

      <div className="marketplace-product-price-row">
        <span className="marketplace-product-price">{marketplaceService.formatPrice(product.price || 0)}</span>
        <span className="marketplace-product-unit">/{product.unit || 'kg'}</span>
      </div>

      <div className="marketplace-product-location">
        <EnvironmentOutlined />
        <span>{getProvince(product.address) || 'Việt Nam'}</span>
      </div>

      <div className="marketplace-product-footer">
        <div className="marketplace-product-meta">
          {product.sold ? `Đã bán ${product.sold}` : 'Mới đăng'}
        </div>

        <Button
          size="small"
          type="text"
          icon={user ? <PhoneOutlined /> : <UserOutlined />}
          onClick={handleContactClick}
          className="marketplace-contact-btn"
        >
          {user ? 'Liên hệ' : 'Đăng nhập'}
        </Button>
      </div>
    </Card>
  );
};

export default memo(ProductCard);
