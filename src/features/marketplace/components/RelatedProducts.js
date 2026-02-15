import React, { memo } from 'react';
import { Card, Typography, Row, Col, Skeleton } from 'antd';

const { Title, Text } = Typography;

const RelatedProducts = ({ products, loading, onProductClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <Card style={{ marginTop: 24 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Sản phẩm liên quan</Title>
        <Row gutter={[16, 16]}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Col xs={12} sm={12} md={8} lg={6} key={index}>
              <Card>
                <Skeleton.Image active style={{ width: '100%', height: 150 }} />
                <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 12 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Card style={{ marginTop: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Sản phẩm liên quan</Title>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              onClick={() => onProductClick(product.id)}
              cover={
                <div style={{ height: 150, overflow: 'hidden' }}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
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
                    {product.name}
                  </Text>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {product.supplier}
                    </Text>
                    <br />
                    <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
                      {formatPrice(product.price)}
                    </Text>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default memo(RelatedProducts);
