import React from 'react';
import { Card, Tabs, Typography, Row, Col } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductTabs = ({ product }) => {
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
    <Card style={{ marginTop: 24 }}>
      <Tabs defaultActiveKey="description">
        <TabPane tab="Mô tả sản phẩm" key="description">
          <div style={{ padding: '16px 0' }}>
            <Paragraph>{product.description}</Paragraph>
            
            <Title level={5}>Thông tin chi tiết:</Title>
            <ul style={{ paddingLeft: 20 }}>
              <li>Danh mục: {product.category}</li>
              {product.quantity && <li>Số lượng: {product.quantity} {product.unit}</li>}
              {product.location && <li>Xuất xứ: {product.location}</li>}
              {product.transactionIntent && (
                <li>Loại giao dịch: {
                  product.transactionIntent === 'b2b' ? 'Bán buôn' :
                  product.transactionIntent === 'export' ? 'Xuất khẩu' : 'Bán lẻ'
                }</li>
              )}
            </ul>
          </div>
        </TabPane>
        
        <TabPane tab="Thông số kỹ thuật" key="specifications">
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}><Text strong>Tên sản phẩm:</Text></Col>
              <Col span={16}><Text>{product.name}</Text></Col>
              
              <Col span={8}><Text strong>Danh mục:</Text></Col>
              <Col span={16}><Text>{product.category}</Text></Col>
              
              <Col span={8}><Text strong>Giá:</Text></Col>
              <Col span={16}><Text>{formatPrice(product.price)}/{product.unit}</Text></Col>
              
              {product.quantity && (
                <>
                  <Col span={8}><Text strong>Số lượng:</Text></Col>
                  <Col span={16}><Text>{product.quantity} {product.unit}</Text></Col>
                </>
              )}
              
              {product.location && (
                <>
                  <Col span={8}><Text strong>Vị trí:</Text></Col>
                  <Col span={16}><Text>{product.location}</Text></Col>
                </>
              )}
              
              <Col span={8}><Text strong>Ngày đăng:</Text></Col>
              <Col span={16}><Text>{formatDate(product.createdAt)}</Text></Col>
            </Row>
          </div>
        </TabPane>
        
        <TabPane tab="Đánh giá" key="reviews">
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            Chưa có đánh giá nào
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ProductTabs;