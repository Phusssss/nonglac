import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Row, Col, Table, Tag } from 'antd';
import AdvancedSEO from '../components/AdvancedSEO';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const GiaLuaGao = () => {
  const [riceData, setRiceData] = useState([]);

  useEffect(() => {
    // Simulate loading rice price data
    setRiceData([
      { key: '1', type: 'Gạo ST25', price: 28000, change: 1.5, region: 'An Giang' },
      { key: '2', type: 'Gạo Jasmine', price: 25000, change: -0.8, region: 'Đồng Tháp' },
      { key: '3', type: 'Gạo IR64', price: 18000, change: 2.1, region: 'Cần Thơ' },
      { key: '4', type: 'Lúa tươi', price: 7500, change: 1.2, region: 'Kiên Giang' },
    ]);
  }, []);

  const columns = [
    {
      title: 'Loại gạo/lúa',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Giá (VNĐ/kg)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{price.toLocaleString()}</span>
    },
    {
      title: 'Biến động (%)',
      dataIndex: 'change',
      key: 'change',
      render: (change) => (
        <Tag color={change > 0 ? 'green' : 'red'}>
          {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
        </Tag>
      )
    },
    {
      title: 'Vùng',
      dataIndex: 'region',
      key: 'region'
    }
  ];

  const breadcrumbs = [
    { name: 'Trang chủ', url: '/' },
    { name: 'Giá nông sản', url: '/gia-nong-san' },
    { name: 'Giá lúa gạo', url: '/gia-lua-gao' }
  ];

  const faq = [
    {
      question: 'Giá gạo ST25 hôm nay bao nhiêu?',
      answer: 'Giá gạo ST25 hiện tại là 28,000 VNĐ/kg, tăng 1.5% so với hôm qua tại vùng An Giang.'
    },
    {
      question: 'Vì sao giá lúa gạo tăng?',
      answer: 'Giá lúa gạo tăng do nhu cầu xuất khẩu cao, thời tiết thuận lợi và chất lượng gạo Việt Nam được quốc tế công nhận.'
    }
  ];

  return (
    <>
      <AdvancedSEO
        title="Giá Lúa Gạo Hôm Nay - Cập Nhật Mới Nhất | NôngLạc"
        description="Cập nhật giá lúa gạo mới nhất hôm nay. Giá gạo ST25, Jasmine, IR64 tại ĐBSCL. Phân tích xu hướng thị trường lúa gạo Việt Nam."
        keywords="giá lúa gạo, giá gạo hôm nay, gạo ST25, gạo jasmine, thị trường lúa gạo, giá lúa tươi, xuất khẩu gạo việt nam"
        url="/gia-lua-gao"
        breadcrumbs={breadcrumbs}
        faq={faq}
      />
      
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '20px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <Card style={{ marginBottom: 24 }}>
              <Title level={1} style={{ color: '#4CAF50', marginBottom: 16 }}>
                🌾 Giá Lúa Gạo Hôm Nay
              </Title>
              <Paragraph style={{ fontSize: 16, color: '#666' }}>
                Cập nhật giá lúa gạo mới nhất từ vùng Đồng bằng sông Cửu Long. 
                Theo dõi biến động giá và xu hướng xuất khẩu gạo Việt Nam.
              </Paragraph>
            </Card>

            {/* Price Table */}
            <Card title="📊 Bảng Giá Lúa Gạo" style={{ marginBottom: 24 }}>
              <Table 
                columns={columns} 
                dataSource={riceData} 
                pagination={false}
                scroll={{ x: 600 }}
              />
            </Card>

            {/* Market Analysis */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="📈 Phân Tích Thị Trường" style={{ height: '100%' }}>
                  <Paragraph>
                    <strong>Xu hướng xuất khẩu:</strong> Gạo Việt Nam đang có nhu cầu cao 
                    trên thị trường quốc tế, đặc biệt là gạo ST25.
                  </Paragraph>
                  <Paragraph>
                    <strong>Chất lượng:</strong> Gạo ST25 được công nhận là gạo ngon nhất 
                    thế giới, giúp nâng cao giá trị xuất khẩu.
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="🌍 Thị Trường Xuất Khẩu" style={{ height: '100%' }}>
                  <Paragraph>
                    <strong>Thị trường chính:</strong> Philippines, Malaysia, Singapore, 
                    Trung Quốc là những thị trường nhập khẩu gạo Việt lớn nhất.
                  </Paragraph>
                  <Paragraph>
                    <strong>Triển vọng:</strong> Nhu cầu gạo chất lượng cao tiếp tục tăng, 
                    tạo cơ hội cho nông dân Việt Nam.
                  </Paragraph>
                </Card>
              </Col>
            </Row>

            {/* Regional Information */}
            <Card title="🗺️ Thông Tin Theo Vùng" style={{ marginTop: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Title level={4}>An Giang</Title>
                    <p>Vùng trồng gạo ST25</p>
                    <p><strong>Diện tích:</strong> 150,000 ha</p>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Title level={4}>Đồng Tháp</Title>
                    <p>Vùng trồng gạo Jasmine</p>
                    <p><strong>Diện tích:</strong> 120,000 ha</p>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Title level={4}>Cần Thơ</Title>
                    <p>Trung tâm chế biến gạo</p>
                    <p><strong>Sản lượng:</strong> 2.5 triệu tấn/năm</p>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Title level={4}>Kiên Giang</Title>
                    <p>Vùng sản xuất lúa lớn</p>
                    <p><strong>Diện tích:</strong> 200,000 ha</p>
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

export default GiaLuaGao;