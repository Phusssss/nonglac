import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import ProductCard from './ProductCard';
import { marketplaceService } from '../services';

const ProductGrid = ({ 
  products = [], 
  loading, 
  onContactClick, 
  onProductClick,
  user 
}) => {
  // Guard clause for invalid products
  if (!Array.isArray(products)) {
    console.warn('ProductGrid: products prop must be an array');
    return null;
  }
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Col key={index} xs={12} sm={12} md={8} lg={6} xl={6}>
            <Skeleton.Image style={{ width: '100%', height: 200 }} />
            <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
          </Col>
        ))}
      </Row>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
        <h3 style={{ fontSize: 18, marginBottom: 8, color: '#666' }}>Chưa có sản phẩm</h3>
        <p style={{ color: '#999' }}>Đăng sản phẩm đầu tiên của bạn!</p>
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {products.map(product => {
        if (!product?.id) {
          console.warn('ProductGrid: Product missing required id field', product);
          return null;
        }
        
        return (
          <Col key={product.id} xs={12} sm={12} md={8} lg={6} xl={6}>
            <ProductCard
              product={product}
              onContactClick={onContactClick}
              onProductClick={onProductClick}
              getTrustScoreIcon={marketplaceService.getTrustScoreIcon}
              formatPrice={marketplaceService.formatPrice}
              formatDate={marketplaceService.formatDate}
              user={user}
            />
          </Col>
        );
      })}
    </Row>
  );
};

export default ProductGrid;