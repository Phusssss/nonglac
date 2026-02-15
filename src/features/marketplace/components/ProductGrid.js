import React, { memo } from 'react';
import { Row, Col, Skeleton } from 'antd';
import ProductCard from './ProductCard';

const ProductGrid = ({
  products = [],
  loading,
  onContactClick,
  onProductClick,
  onPreviewImages,
  user
}) => {
  if (!Array.isArray(products)) {
    console.warn('ProductGrid: products prop must be an array');
    return null;
  }

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Col key={index} xs={12} sm={12} md={8} lg={6} xl={6}>
            <div className="marketplace-skeleton-card">
              <Skeleton.Image style={{ width: '100%', height: 210 }} active />
              <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
            </div>
          </Col>
        ))}
      </Row>
    );
  }

  if (products.length === 0) {
    return (
      <div className="marketplace-empty">
        <div className="marketplace-empty-icon">🌿</div>
        <h3>Chưa có sản phẩm phù hợp</h3>
        <p>Thử nới điều kiện lọc hoặc đăng sản phẩm đầu tiên của bạn.</p>
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => {
        if (!product?.id) return null;

        return (
          <Col key={product.id} xs={12} sm={12} md={8} lg={6} xl={6}>
            <ProductCard
              product={product}
              onContactClick={onContactClick}
              onProductClick={onProductClick}
              onPreviewImages={onPreviewImages}
              user={user}
            />
          </Col>
        );
      })}
    </Row>
  );
};

export default memo(ProductGrid);
