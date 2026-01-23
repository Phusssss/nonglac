import React from 'react';
import { Layout, Typography, Card, Row, Col, Button, Divider, Space, Avatar, Tag } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdvancedSEO from '../components/AdvancedSEO';

const { Title, Paragraph, Text } = Typography;

const AboutUs = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: 'PHAN ĐỨC HUY',
      role: 'Trưởng Dự Án',
      philosophy: 'Hiệu quả cuối cùng (Bottom line) là thước đo duy nhất của chiến lược.',
      avatar: '🎯'
    },
    {
      name: 'TRẦM NGỌC BÍCH',
      role: 'Giám đốc Vận hành - COO',
      philosophy: 'Không có dữ liệu đúng, niềm tin chỉ là ảo giác.',
      avatar: '📊'
    },
    {
      name: 'NGUYỄN TRÂM ANH',
      role: 'Giám đốc Thương hiệu - CMO',
      philosophy: 'Kết nối bằng công nghệ, giữ chân bằng trái tim.',
      avatar: '💝'
    },
    {
      name: 'VĂN PHÚ',
      role: 'Giám đốc Công nghệ - CTO',
      philosophy: 'Tốc độ hơn Hoàn hảo (Done is better than Perfect).',
      avatar: '⚡'
    }
  ];

  const partners = [
    { name: 'Google Cloud', type: 'Hạ tầng Công nghệ' },
    { name: 'VNPT', type: 'Xác thực & Viễn thông' },
    { name: 'Viettel', type: 'Mobile ID Partner' },
    { name: 'Đại học Yersin Đà Lạt', type: 'Hỗ trợ Khởi nghiệp' }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <AdvancedSEO 
        title="Về chúng tôi - NôngLạc | Hệ điều hành Niềm tin Nông nghiệp"
        description="Tìm hiểu về NôngLạc - Hệ điều hành Niềm tin cho nông nghiệp Việt Nam. Số hóa niềm tin, biến uy tín thành tài sản và đưa sự minh bạch trở lại thị trường."
        keywords="về nông lạc, hệ điều hành niềm tin, nông nghiệp việt nam, agri-trust score, đội ngũ nông lạc"
        url="/about-us"
      />
      
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Text 
            style={{ color: '#1890ff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            Quay lại
          </Text>
        </div>

        {/* HERO SECTION */}
        <Card 
          style={{ 
            borderRadius: 16, 
            marginBottom: 32,
            background: 'linear-gradient(135deg, #52c41a, #389e0d)',
            border: 'none',
            color: 'white'
          }}
          styles={{ body: { padding: '48px 32px', textAlign: 'center' } }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌾📱</div>
            <Title level={1} style={{ color: 'white', marginBottom: 16, fontSize: '2.5rem' }}>
              NÔNG LẠC - HỆ ĐIỀU HÀNH NIỀM TIN
            </Title>
            <Title level={2} style={{ color: 'white', fontWeight: 400, marginBottom: 24 }}>
              CHO NÔNG NGHIỆP VIỆT NAM
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, maxWidth: 800, margin: '0 auto 32px' }}>
              Chúng tôi không chỉ số hóa nông sản. Chúng tôi số hóa niềm tin, biến uy tín thành tài sản và đưa sự minh bạch trở lại thị trường.
            </Paragraph>
            <Space size="large">
              <Button 
                type="primary" 
                size="large" 
                icon={<PlayCircleOutlined />}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: '2px solid white',
                  borderRadius: 8,
                  height: 48
                }}
                onClick={() => window.open('https://youtu.be/demo-nonglac', '_blank')}
              >
                Video Demo
              </Button>
              <Button 
                size="large" 
                icon={<DownloadOutlined />}
                style={{ 
                  background: '#EDB324', 
                  border: 'none',
                  color: 'white',
                  borderRadius: 8,
                  height: 48
                }}
                onClick={() => window.open('https://docs.google.com/presentation/d/1IFn58PyD6PU7rx4ZOBk1C1jmPPFa4o24d-2aEZRvUvg/edit?slide=id.p12#slide=id.p12', '_blank')}
              >
                Hồ sơ Năng lực
              </Button>
            </Space>
          </div>
        </Card>

        {/* CÂU CHUYỆN KHỞI NGUYÊN */}
        <Row gutter={[32, 32]} style={{ marginBottom: 48 }}>
          <Col xs={24} lg={12}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
              borderRadius: 16,
              padding: 48,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 120
            }}>
              🦅🌍
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: 16, height: '100%' }}>
              <Title level={2} style={{ color: '#52c41a' }}>CÂU CHUYỆN KHỞI NGUYÊN & SỨ MỆNH</Title>
              
              <Title level={4} style={{ color: '#1890ff' }}>Bối Cảnh: Cuộc Cách Mạng Độc Lập Dữ Liệu</Title>
              <Paragraph>
                Nông nghiệp nước ta đang rơi vào trạng thái <Text strong>"Entropy cao"</Text> (hỗn loạn): 
                thông tin thị trường nhiễu loạn, niềm tin sụp đổ, dẫn đến điệp khúc <Text strong style={{ color: '#ff4d4f' }}>"được mùa mất giá"</Text> và 
                nạn <Text strong style={{ color: '#ff4d4f' }}>"bẻ cọc"</Text> triền miên.
              </Paragraph>

              <Title level={4} style={{ color: '#1890ff' }}>Sứ Mệnh: Giải Quyết "Khủng Hoảng Kép"</Title>
              <Paragraph>
                Nông Lạc định vị mình là <Text strong style={{ color: '#52c41a' }}>"Bộ điều chỉnh Entropy"</Text> - 
                sử dụng công nghệ để sắp xếp lại trật tự, minh bạch hóa dòng chảy thông tin và đưa nông sản Việt về đúng Giá trị thật.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* GIÁ TRỊ CỐT LÕI */}
        <Card style={{ borderRadius: 16, marginBottom: 48 }}>
          <Title level={2} style={{ color: '#52c41a', textAlign: 'center', marginBottom: 32 }}>
            GIÁ TRỊ CỐT LÕI - TRIẾT LÝ CÂY CỔ THỤ
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card 
                style={{ 
                  borderRadius: 12, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fff7e6, #ffd591)'
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌳</div>
                <Title level={4} style={{ color: '#d4380d' }}>BỘ RỄ</Title>
                <Text strong>Người Nông Dân - The Foundation</Text>
                <Paragraph style={{ marginTop: 12 }}>
                  Cần bám sâu vào "đất" (dữ liệu canh tác chuẩn, quy trình VietGAP). 
                  Nông Lạc cung cấp công cụ "Nhật ký canh tác số".
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                style={{ 
                  borderRadius: 12, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f6ffed, #d9f7be)'
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
                <Title level={4} style={{ color: '#389e0d' }}>THÂN CÂY</Title>
                <Text strong>Công Nghệ Nông Lạc - The Core</Text>
                <Paragraph style={{ marginTop: 12 }}>
                  Phải sừng sững, thẳng đứng và minh bạch tuyệt đối (Radical Transparency). 
                  Trục "Hợp tác trong Cạnh tranh" (Coopetition).
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                style={{ 
                  borderRadius: 12, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e6f7ff, #91d5ff)'
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
                <Title level={4} style={{ color: '#0958d9' }}>TÁN CÂY</Title>
                <Text strong>Lợi Nhuận & Tác Động - The Impact</Text>
                <Paragraph style={{ marginTop: 12 }}>
                  Tỏa bóng mát cho đời. Lợi nhuận song hành với sự thịnh vượng của cộng đồng 
                  và sự trong lành của môi trường (Net Zero).
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* THÁCH THỨC & GIẢI PHÁP */}
        <Card style={{ borderRadius: 16, marginBottom: 48 }}>
          <Title level={2} style={{ color: '#52c41a', marginBottom: 32 }}>THÁCH THỨC & GIẢI PHÁP</Title>
          
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} lg={12}>
              <Title level={4} style={{ color: '#ff4d4f' }}>Nỗi Đau Của Thị Trường</Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card size="small" style={{ background: '#fff2f0' }}>
                  <Text strong style={{ color: '#cf1322' }}>Nông Dân:</Text>
                  <Paragraph style={{ margin: '8px 0 0' }}>
                    Không biết giá thị trường thực, rơi vào "bẫy tín dụng đen", sản xuất manh mún.
                  </Paragraph>
                </Card>
                <Card size="small" style={{ background: '#fff2f0' }}>
                  <Text strong style={{ color: '#cf1322' }}>Thương Lái:</Text>
                  <Paragraph style={{ margin: '8px 0 0' }}>
                    Nông dân "bẻ kèo", xe tải chạy rỗng chiều về gây lãng phí 25% chi phí.
                  </Paragraph>
                </Card>
                <Card size="small" style={{ background: '#fff2f0' }}>
                  <Text strong style={{ color: '#cf1322' }}>Ngân Hàng:</Text>
                  <Paragraph style={{ margin: '8px 0 0' }}>
                    Không thể thẩm định tín dụng cho hàng triệu nông hộ nhỏ lẻ.
                  </Paragraph>
                </Card>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4} style={{ color: '#52c41a' }}>Giải Pháp Nông Lạc</Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card size="small" style={{ background: '#f6ffed' }}>
                  <Text strong style={{ color: '#389e0d' }}>Agri-Trust Score:</Text>
                  <Paragraph style={{ margin: '8px 0 0' }}>
                    Thuật toán định lượng uy tín dựa trên Quy tắc 20-30-50
                  </Paragraph>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                    <li>20% Dữ liệu Xác thực (Mobile ID & GPS)</li>
                    <li>30% Dữ liệu Canh tác (Nhật ký, quy trình)</li>
                    <li>50% Dữ liệu Giao dịch & Xã hội</li>
                  </ul>
                </Card>
                <Card size="small" style={{ background: '#f6ffed' }}>
                  <Text strong style={{ color: '#389e0d' }}>Mobile ID & Xác thực Thụ động:</Text>
                  <Paragraph style={{ margin: '8px 0 0' }}>
                    Loại bỏ rào cản eKYC phức tạp, trải nghiệm "Zero Friction".
                  </Paragraph>
                </Card>
                <Card size="small" style={{ background: '#f6ffed' }}>
                  <Text strong style={{ color: '#389e0d' }}>AI Plant Doctor:</Text>
                  <Paragraph style={{ margin: '8px 0 0' }}>
                    Chẩn đoán bệnh qua ảnh chụp, tương tác bằng giọng nói.
                  </Paragraph>
                </Card>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* ĐỘI NGŨ */}
        <Card style={{ borderRadius: 16, marginBottom: 48 }}>
          <Title level={2} style={{ color: '#52c41a', textAlign: 'center', marginBottom: 32 }}>
            ĐỘI NGŨ LÃNH ĐẠO
          </Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: 32, fontSize: 16 }}>
            Với tư duy thực chiến và khát vọng đổi mới
          </Paragraph>
          
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            {teamMembers.map((member, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  style={{ 
                    borderRadius: 12, 
                    textAlign: 'center',
                    height: '100%'
                  }}
                  hoverable
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{member.avatar}</div>
                  <Title level={5} style={{ marginBottom: 8 }}>{member.name}</Title>
                  <Tag color="blue" style={{ marginBottom: 12 }}>{member.role}</Tag>
                  <Paragraph style={{ fontStyle: 'italic', fontSize: 12 }}>
                    "{member.philosophy}"
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{ color: '#722ed1' }}>CỐ VẤN CHIẾN LƯỢC</Title>
            <Card 
              style={{ 
                maxWidth: 400, 
                margin: '0 auto',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f9f0ff, #efdbff)'
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🏫</div>
              <Title level={5}>PGS.TS ĐINH TIÊN MINH</Title>
              <Text>Trưởng Bộ môn Marketing - Khoa Kinh doanh Quốc tế & Marketing (UEH)</Text>
              <Paragraph style={{ marginTop: 12, fontStyle: 'italic' }}>
                Người dẫn đường về tư duy quản trị và chiến lược thị trường
              </Paragraph>
            </Card>
          </div>
        </Card>

        {/* TÁC ĐỘNG & ĐỐI TÁC */}
        <Row gutter={[32, 32]} style={{ marginBottom: 48 }}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: 16, height: '100%' }}>
              <Title level={3} style={{ color: '#52c41a' }}>CAM KẾT ESG</Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Tag color="green" style={{ marginBottom: 8 }}>E - Environment</Tag>
                  <Paragraph>
                    Giảm 20% lượng khí thải CO2 nhờ thuật toán tối ưu logistics. 
                    Tiên phong xây dựng cơ sở dữ liệu cho thị trường Tín chỉ Carbon.
                  </Paragraph>
                </div>
                <div>
                  <Tag color="blue" style={{ marginBottom: 8 }}>S - Social</Tag>
                  <Paragraph>
                    Mục tiêu đến 2030 hỗ trợ 10.000 nông dân tiếp cận vốn vay ngân hàng chính thống, 
                    thoát bẫy tín dụng đen.
                  </Paragraph>
                </div>
                <div>
                  <Tag color="purple" style={{ marginBottom: 8 }}>G - Governance</Tag>
                  <Paragraph>
                    Minh bạch hóa 100% hợp đồng thu mua, giảm thiểu tranh chấp thương mại 
                    bằng Hợp đồng số (Smart Contracts).
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: 16, height: '100%' }}>
              <Title level={3} style={{ color: '#52c41a' }}>ĐỐI TÁC CHIẾN LƯỢC</Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {partners.map((partner, index) => (
                  <Card 
                    key={index}
                    size="small" 
                    style={{ 
                      background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                      border: '1px solid #91d5ff'
                    }}
                  >
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong style={{ color: '#0958d9' }}>{partner.name}</Text>
                      </Col>
                      <Col>
                        <Tag color="cyan">{partner.type}</Tag>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* FOOTER & LIÊN HỆ */}
        <Card 
          style={{ 
            borderRadius: 16,
            background: 'linear-gradient(135deg, #001529, #002140)',
            color: 'white'
          }}
        >
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <Title level={3} style={{ color: 'white' }}>THÔNG TIN LIÊN HỆ</Title>
              <Space direction="vertical" size="middle">
                <div>
                  <Text strong style={{ color: '#91d5ff' }}>Trụ sở chính:</Text>
                  <br />
                  <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                    Vườn ươm Khởi nghiệp, Trường Đại học Yersin Đà Lạt<br />
                    27 Tôn Thất Tùng, P.8, TP. Đà Lạt
                  </Text>
                </div>
                <div>
                  <Text strong style={{ color: '#91d5ff' }}>Hotline Hỗ trợ:</Text>
                  <br />
                  <Text style={{ color: 'rgba(255,255,255,0.85)' }}>(+84) 938 xxx xxx</Text>
                </div>
                <div>
                  <Text strong style={{ color: '#91d5ff' }}>Email:</Text>
                  <br />
                  <Text style={{ color: 'rgba(255,255,255,0.85)' }}>administration@nonglac.com</Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={3} style={{ color: 'white' }}>KẾT NỐI VỚI CHÚNG TÔI</Title>
              <Space size="large">
                <Button 
                  type="primary" 
                  style={{ 
                    background: '#1877f2', 
                    border: 'none',
                    borderRadius: 8
                  }}
                >
                  Facebook
                </Button>
                <Button 
                  style={{ 
                    background: '#0084ff', 
                    border: 'none',
                    color: 'white',
                    borderRadius: 8
                  }}
                >
                  Zalo OA
                </Button>
              </Space>
              <Divider style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
                © 2025 Nông Lạc. All Rights Reserved.
              </Text>
            </Col>
          </Row>
        </Card>
      </div>
    </Layout>
  );
};

export default AboutUs;