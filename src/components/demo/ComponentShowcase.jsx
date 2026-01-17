import React from 'react';
import { Row, Col, Space, Typography, Divider, Button } from 'antd';
import { HeartOutlined, ShareAltOutlined, EyeOutlined } from '@ant-design/icons';
import { NongLacCard, PriceDisplay, CategoryTag } from '../common';

const { Title, Paragraph } = Typography;

export const ComponentShowcase = () => {
  // Sample data
  const sampleProducts = [
    {
      id: 1,
      name: 'Cà chua cherry hữu cơ',
      category: 'vegetables',
      currentPrice: 85000,
      previousPrice: 80000,
      description: 'Cà chua cherry hữu cơ tươi ngon, không thuốc trừ sâu, trồng tại Đà Lạt.',
      location: 'Đà Lạt, Lâm Đồng',
      seller: 'Nông trại Xanh'
    },
    {
      id: 2,
      name: 'Xoài cát Hòa Lộc',
      category: 'fruits',
      currentPrice: 120000,
      previousPrice: 130000,
      description: 'Xoài cát Hòa Lộc ngọt thơm, múi mềm, không xơ. Hái chín cây.',
      location: 'Tiền Giang',
      seller: 'Vườn xoài Miền Tây'
    },
    {
      id: 3,
      name: 'Gạo ST25 thơm dẻo',
      category: 'grains',
      currentPrice: 45000,
      previousPrice: 45000,
      description: 'Gạo ST25 đạt giải thưởng gạo ngon nhất thế giới, thơm dẻo tự nhiên.',
      location: 'An Giang',
      seller: 'HTX Nông dân'
    },
    {
      id: 4,
      name: 'Thịt heo sạch VietGAP',
      category: 'livestock',
      currentPrice: 180000,
      previousPrice: 175000,
      description: 'Thịt heo sạch đạt chuẩn VietGAP, nuôi bằng thức ăn tự nhiên.',
      location: 'Đồng Nai',
      seller: 'Trang trại Sạch'
    },
    {
      id: 5,
      name: 'Tôm sú tươi sống',
      category: 'aquaculture',
      currentPrice: 320000,
      previousPrice: 310000,
      description: 'Tôm sú tươi sống, nuôi trong môi trường nước mặn tự nhiên.',
      location: 'Cà Mau',
      seller: 'Hợp tác xã Thủy sản'
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#F6FFED', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: 8 }}>
          🎨 NôngLạc Design System
        </Title>
        <Paragraph style={{ textAlign: 'center', fontSize: 16, marginBottom: 40 }}>
          Hệ thống thiết kế tối ưu cho nền tảng nông nghiệp với Ant Design
        </Paragraph>

        {/* Category Tags Demo */}
        <Title level={2}>🏷️ Category Tags</Title>
        <Space wrap style={{ marginBottom: 32 }}>
          <CategoryTag category="vegetables" size="small" />
          <CategoryTag category="fruits" />
          <CategoryTag category="grains" size="large" />
          <CategoryTag category="livestock" showIcon={false} />
          <CategoryTag category="aquaculture" showLabel={false} />
        </Space>

        {/* Price Display Demo */}
        <Title level={2}>💰 Price Display Components</Title>
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <NongLacCard
              title="Giá nhỏ"
              content={
                <PriceDisplay
                  currentPrice={85000}
                  previousPrice={80000}
                  size="small"
                />
              }
            />
          </Col>
          <Col xs={24} sm={8}>
            <NongLacCard
              title="Giá trung bình"
              content={
                <PriceDisplay
                  currentPrice={120000}
                  previousPrice={130000}
                  size="default"
                />
              }
            />
          </Col>
          <Col xs={24} sm={8}>
            <NongLacCard
              title="Giá lớn"
              content={
                <PriceDisplay
                  currentPrice={320000}
                  previousPrice={310000}
                  size="large"
                />
              }
            />
          </Col>
        </Row>

        {/* Product Cards Demo */}
        <Title level={2}>🛒 Product Cards</Title>
        <Row gutter={[24, 24]}>
          {sampleProducts.map(product => (
            <Col key={product.id} xs={24} sm={12} lg={8}>
              <NongLacCard
                title={product.name}
                subtitle={`${product.seller} • ${product.location}`}
                category={product.category}
                content={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <PriceDisplay
                      currentPrice={product.currentPrice}
                      previousPrice={product.previousPrice}
                      size="default"
                    />
                    <Paragraph 
                      ellipsis={{ rows: 2 }}
                      style={{ margin: 0, color: '#595959' }}
                    >
                      {product.description}
                    </Paragraph>
                  </Space>
                }
                actions={[
                  <Button 
                    key="view" 
                    type="text" 
                    icon={<EyeOutlined />}
                    style={{ color: '#52C41A' }}
                  >
                    Xem chi tiết
                  </Button>,
                  <Button 
                    key="like" 
                    type="text" 
                    icon={<HeartOutlined />}
                    style={{ color: '#FF4D4F' }}
                  >
                    Yêu thích
                  </Button>,
                  <Button 
                    key="share" 
                    type="text" 
                    icon={<ShareAltOutlined />}
                    style={{ color: '#1890FF' }}
                  >
                    Chia sẻ
                  </Button>
                ]}
              />
            </Col>
          ))}
        </Row>

        <Divider style={{ margin: '48px 0' }} />

        {/* Color Palette Demo */}
        <Title level={2}>🎨 Color Palette</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <NongLacCard
              title="Rau củ"
              content={
                <div style={{ 
                  height: 60, 
                  backgroundColor: '#52C41A', 
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  #52C41A
                </div>
              }
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <NongLacCard
              title="Trái cây"
              content={
                <div style={{ 
                  height: 60, 
                  backgroundColor: '#FA8C16', 
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  #FA8C16
                </div>
              }
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <NongLacCard
              title="Ngũ cốc"
              content={
                <div style={{ 
                  height: 60, 
                  backgroundColor: '#FAAD14', 
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  #FAAD14
                </div>
              }
            />
          </Col>
        </Row>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Button 
            type="primary" 
            size="large"
            style={{ 
              borderRadius: 8,
              paddingInline: 32,
              height: 48,
              fontSize: 16,
              fontWeight: 500
            }}
          >
            Khám phá thêm components
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;