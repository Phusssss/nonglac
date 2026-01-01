import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Row, Col, Spin, Alert } from 'antd';
import AdvancedSEO from '../components/AdvancedSEO';
import CoffeePrices from '../components/CoffeePrices';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const GiaCaPhe = () => {
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    // Simulate loading price data
    setTimeout(() => {
      setPriceData({
        robusta: { price: 125000, change: 2.5 },
        arabica: { price: 180000, change: -1.2 }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const breadcrumbs = [
    { name: 'Trang chủ', url: '/' },
    { name: 'Giá nông sản', url: '/gia-nong-san' },
    { name: 'Giá cà phê', url: '/gia-ca-phe' }
  ];

  const faq = [
    {
      question: 'Giá cà phê hôm nay bao nhiêu?',
      answer: 'Giá cà phê Robusta hiện tại là 125,000 VNĐ/kg, tăng 2.5% so với hôm qua. Giá cà phê Arabica là 180,000 VNĐ/kg.'
    },
    {
      question: 'Tại sao giá cà phê biến động?',
      answer: 'Giá cà phê biến động do nhiều yếu tố như thời tiết, cung cầu thị trường, giá cà phê thế giới, tỷ giá USD/VND.'
    },
    {
      question: 'Khi nào nên bán cà phê?',
      answer: 'Nên theo dõi xu hướng giá và bán khi giá ở mức cao. Tham khảo ý kiến chuyên gia và phân tích thị trường.'
    }
  ];

  return (
    <>
      <AdvancedSEO
        title="Giá Cà Phê Hôm Nay - Cập Nhật Mới Nhất | NôngLạc"
        description="Cập nhật giá cà phê mới nhất hôm nay. Giá cà phê Robusta, Arabica tại các vùng trồng. Phân tích xu hướng và dự báo giá cà phê Việt Nam."
        keywords="giá cà phê, giá cà phê hôm nay, cà phê robusta, cà phê arabica, thị trường cà phê, giá cà phê việt nam, xu hướng giá cà phê"
        url="/gia-ca-phe"
        breadcrumbs={breadcrumbs}
        faq={faq}
      />
      
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '20px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <Card style={{ marginBottom: 24 }}>
              <Title level={1} style={{ color: '#4CAF50', marginBottom: 16 }}>
                🌱 Giá Cà Phê Hôm Nay
              </Title>
              <Paragraph style={{ fontSize: 16, color: '#666' }}>
                Cập nhật giá cà phê mới nhất từ các vùng trồng cà phê lớn nhất Việt Nam. 
                Theo dõi xu hướng biến động và đưa ra quyết định mua bán thông minh.
              </Paragraph>
            </Card>

            {/* Price Display */}
            {loading ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Đang tải dữ liệu giá cà phê...</p>
                </div>
              </Card>
            ) : (
              <CoffeePrices />
            )}

            {/* Market Analysis */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col xs={24} md={12}>
                <Card title="📈 Phân Tích Thị Trường" style={{ height: '100%' }}>
                  <Paragraph>
                    <strong>Xu hướng hiện tại:</strong> Giá cà phê đang có xu hướng tăng nhẹ 
                    do ảnh hưởng của thời tiết khô hạn tại các vùng trồng chính.
                  </Paragraph>
                  <Paragraph>
                    <strong>Dự báo:</strong> Giá có thể tiếp tục tăng trong tuần tới 
                    nếu tình hình thời tiết không cải thiện.
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="💡 Lời Khuyên Chuyên Gia" style={{ height: '100%' }}>
                  <Paragraph>
                    <strong>Cho người trồng:</strong> Nên tích trữ một phần sản lượng 
                    để bán khi giá tăng cao hơn.
                  </Paragraph>
                  <Paragraph>
                    <strong>Cho người mua:</strong> Có thể mua vào khi giá giảm 
                    để tận dụng cơ hội đầu tư.
                  </Paragraph>
                </Card>
              </Col>
            </Row>

            {/* Regional Prices */}
            <Card title="🗺️ Giá Cà Phê Theo Vùng" style={{ marginTop: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small">
                    <Title level={4}>Đắk Lắk</Title>
                    <p>Robusta: <strong>125,000 VNĐ/kg</strong></p>
                    <p style={{ color: '#52c41a' }}>↗ +2.5%</p>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small">
                    <Title level={4}>Gia Lai</Title>
                    <p>Robusta: <strong>124,500 VNĐ/kg</strong></p>
                    <p style={{ color: '#52c41a' }}>↗ +2.0%</p>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small">
                    <Title level={4}>Đắk Nông</Title>
                    <p>Robusta: <strong>125,200 VNĐ/kg</strong></p>
                    <p style={{ color: '#52c41a' }}>↗ +2.3%</p>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small">
                    <Title level={4}>Lâm Đồng</Title>
                    <p>Arabica: <strong>180,000 VNĐ/kg</strong></p>
                    <p style={{ color: '#ff4d4f' }}>↘ -1.2%</p>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* FAQ Section */}
            <Card title="❓ Câu Hỏi Thường Gặp" style={{ marginTop: 24 }}>
              {faq.map((item, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <Title level={5}>{item.question}</Title>
                  <Paragraph>{item.answer}</Paragraph>
                </div>
              ))}
            </Card>
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default GiaCaPhe;