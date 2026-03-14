import React from 'react';
import { Button, Card, Row, Col, Typography, Space, Divider, Badge } from 'antd';
import { CheckCircleOutlined, UserOutlined, BookOutlined, TrophyOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.demo.nontext.png';
import '../styles/StudentAffiliateProgram.css';

const { Title, Paragraph, Text } = Typography;

const StudentAffiliateProgram = () => {
  const navigate = useNavigate();

  const handleRegisterAsStudent = () => {
    navigate('/register?userType=student');
  };

  const benefits = [
    {
      icon: <GiftOutlined className="text-3xl text-green-500" />,
      title: 'Nhận Phần Thưởng',
      description: 'Kiếm điểm thưởng và tiền mặt từ mỗi bạn bè bạn giới thiệu'
    },
    {
      icon: <BookOutlined className="text-3xl text-blue-500" />,
      title: 'Học Tập Miễn Phí',
      description: 'Truy cập các khóa học nông nghiệp và kỹ năng kinh doanh'
    },
    {
      icon: <TrophyOutlined className="text-3xl text-yellow-500" />,
      title: 'Cơ Hội Thực Tập',
      description: 'Được ưu tiên tham gia các chương trình thực tập và sự kiện'
    },
    {
      icon: <UserOutlined className="text-3xl text-purple-500" />,
      title: 'Cộng Đồng Sinh Viên',
      description: 'Kết nối với hàng ngàn sinh viên nông nghiệp khác'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Đăng Ký Tài Khoản',
      description: 'Tạo tài khoản sinh viên với thông tin trường học của bạn'
    },
    {
      number: '2',
      title: 'Nhận Mã Giới Thiệu',
      description: 'Lấy mã giới thiệu độc nhất của bạn để chia sẻ'
    },
    {
      number: '3',
      title: 'Chia Sẻ Với Bạn Bè',
      description: 'Mời bạn bè đăng ký qua link của bạn'
    },
    {
      number: '4',
      title: 'Nhận Phần Thưởng',
      description: 'Kiếm tiền và điểm thưởng từ mỗi đăng ký thành công'
    }
  ];

  return (
    <div className="student-affiliate-program">
      {/* Header */}
      <div className="hero-section">
        <div className="hero-content">
          <img src={logo} alt="NongLac Logo" className="hero-logo" />
          <Title level={1} className="hero-title">
            Chương Trình Tiếp Thị Liên Kết Sinh Viên
          </Title>
          <Paragraph className="hero-subtitle">
            Kiếm tiền và nhận phần thưởng bằng cách giới thiệu NongLac cho bạn bè
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleRegisterAsStudent}
            className="hero-button"
          >
            Đăng Ký Ngay
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Benefits Section */}
        <section className="benefits-section">
          <Title level={2} className="section-title">
            Tại Sao Tham Gia?
          </Title>
          <Row gutter={[24, 24]}>
            {benefits.map((benefit, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="benefit-card" hoverable>
                  <div className="benefit-icon">
                    {benefit.icon}
                  </div>
                  <Title level={4}>{benefit.title}</Title>
                  <Paragraph>{benefit.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <Divider />

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <Title level={2} className="section-title">
            Cách Thức Hoạt Động
          </Title>
          <Row gutter={[24, 24]}>
            {steps.map((step, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="step-card">
                  <div className="step-number">{step.number}</div>
                  <Title level={4}>{step.title}</Title>
                  <Paragraph>{step.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <Divider />

        {/* Requirements Section */}
        <section className="requirements-section">
          <Title level={2} className="section-title">
            Yêu Cầu Tham Gia
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div className="requirement-item">
                    <CheckCircleOutlined className="requirement-icon" />
                    <span>Là sinh viên đang học tại một trường đại học hoặc cao đẳng</span>
                  </div>
                  <div className="requirement-item">
                    <CheckCircleOutlined className="requirement-icon" />
                    <span>Có số điện thoại hợp lệ để xác minh tài khoản</span>
                  </div>
                  <div className="requirement-item">
                    <CheckCircleOutlined className="requirement-icon" />
                    <span>Tuổi từ 18 trở lên</span>
                  </div>
                  <div className="requirement-item">
                    <CheckCircleOutlined className="requirement-icon" />
                    <span>Có ý định chia sẻ NongLac với bạn bè</span>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card className="reward-card">
                <Title level={3}>Phần Thưởng Hấp Dẫn</Title>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div className="reward-item">
                    <Badge count="+" style={{ backgroundColor: '#52c41a' }} />
                    <span>50,000đ cho mỗi bạn bè đăng ký thành công</span>
                  </div>
                  <div className="reward-item">
                    <Badge count="+" style={{ backgroundColor: '#1890ff' }} />
                    <span>Bonus 100,000đ khi giới thiệu 5 bạn bè</span>
                  </div>
                  <div className="reward-item">
                    <Badge count="+" style={{ backgroundColor: '#faad14' }} />
                    <span>Truy cập VIP các khóa học cao cấp</span>
                  </div>
                  <div className="reward-item">
                    <Badge count="+" style={{ backgroundColor: '#eb2f96' }} />
                    <span>Cơ hội thực tập tại các công ty nông nghiệp hàng đầu</span>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        <Divider />

        {/* CTA Section */}
        <section className="cta-section">
          <Card className="cta-card">
            <Title level={2} className="text-center">
              Sẵn Sàng Bắt Đầu?
            </Title>
            <Paragraph className="text-center">
              Đăng ký tài khoản sinh viên ngay hôm nay và bắt đầu kiếm tiền
            </Paragraph>
            <div className="text-center">
              <Button 
                type="primary" 
                size="large" 
                onClick={handleRegisterAsStudent}
                className="cta-button"
              >
                Đăng Ký Tài Khoản Sinh Viên
              </Button>
            </div>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer-section">
        <Paragraph className="text-center text-gray-600">
          © 2024 NongLac. Chương trình tiếp thị liên kết sinh viên. Tất cả quyền được bảo lưu.
        </Paragraph>
      </footer>
    </div>
  );
};

export default StudentAffiliateProgram;
