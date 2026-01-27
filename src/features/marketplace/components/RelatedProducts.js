import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

const { Title, Text } = Typography;

const RelatedProducts = ({ products, onProductClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Card style={{ marginTop: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Sản phẩm liên quan</Title>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col xs={12} sm={8} md={6} key={product.id}>
            <Card
              hoverable
              onClick={() => onProductClick(product.id)}
              cover={
                <div style={{ height: 150, overflow: 'hidden' }}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
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

export default RelatedProducts;