import React, { useState } from 'react';
import { Button, Card, Row, Col, Typography, Space, Divider, Checkbox, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../styles/StudentAffiliateProgram.css';

const { Title, Paragraph, Text } = Typography;

const StudentAffiliateProgram = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const termsRef = React.useRef(null);

  const handleRegisterClick = () => {
    termsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRegisterAsStudent = () => {
    if (!agreed) {
      message.warning('Vui lòng đồng ý với các điều khoản trước khi tiếp tục');
      return;
    }
    navigate('/register?userType=student');
  };

  return (
    <div className="student-affiliate-program">
      {/* Header Banner */}
      <div className="hero-section">
        <div className="hero-content">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
              <img src="/logo-final-text.png" alt="Logo" style={{ maxWidth: '150px', height: 'auto', display: 'block' }} />
            </div>
            <Title level={1} className="hero-title" style={{ marginTop: 0 }}>
              Nông Lạc - Số hóa niềm tin thị trường
            </Title>
          </div>
          <Title level={2} style={{ color: '#fff', fontWeight: 300, marginTop: '10px' }}>
            Chiến Dịch Mùa Gặt Số
          </Title>
          <Paragraph className="hero-subtitle">
            Chương trình Tiếp thị Liên kết (Affiliate Marketing) chiến lược
          </Paragraph>
          <Paragraph style={{ color: '#fff', fontSize: '16px', marginTop: '20px', maxWidth: '600px', margin: '20px auto 0' }}>
            Chính thức mở cổng đăng ký tham gia chiến dịch phát triển cộng đồng người dùng thực, lan tỏa giải pháp công nghệ nông nghiệp thông minh đến hàng triệu nông dân Việt Nam.
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleRegisterClick}
            style={{ minWidth: '250px', height: '50px', fontSize: '16px', marginTop: '30px' }}
          >
            Đăng Ký Tài Khoản Sinh Viên
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Purpose Section */}
        <section className="purpose-section">
          <Title level={2} className="section-title">
            Mục đích & Phạm vi áp dụng
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Phạm vi:</Text>
                    <Paragraph style={{ marginTop: '8px' }}>
                      Toàn quốc. Đối tượng hợp lệ là sinh viên đang theo học tại các trường Đại học, Cao đẳng, Học viện.
                    </Paragraph>
                  </div>
                  
                  <Divider style={{ margin: '10px 0' }} />
                  
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Mục tiêu:</Text>
                    <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                      <li><Paragraph style={{ margin: '8px 0' }}>Xây dựng mạng xã hội nông nghiệp thực thụ, minh bạch hóa kết nối giữa nông dân và nhà thu mua</Paragraph></li>
                      <li><Paragraph style={{ margin: '8px 0' }}>Đưa công nghệ AI tiếp cận đại chúng, hỗ trợ canh tác trực tiếp 1-1</Paragraph></li>
                      <li><Paragraph style={{ margin: '8px 0' }}>Tích lũy quỹ điểm TRUST SCORE - tài sản số minh chứng năng lực thực chiến</Paragraph></li>
                    </ul>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        <Divider />

        {/* How to Participate */}
        <section className="participation-section">
          <Title level={2} className="section-title">
            Quy trình tham gia
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <Card className="step-card" hoverable>
                <div className="step-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a', marginBottom: '16px' }}>1</div>
                <Title level={4}>Truy cập</Title>
                <Paragraph>
                  Quét mã QR hoặc truy cập link để tìm hiểu thông tin chiến dịch "Mùa Gặt Số"
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="step-card" hoverable>
                <div className="step-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a', marginBottom: '16px' }}>2</div>
                <Title level={4}>Định danh (KYC)</Title>
                <Paragraph>
                  Đăng ký tài khoản Nông Lạc và hoàn tất xác minh danh tính để minh bạch dữ liệu
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="step-card" hoverable>
                <div className="step-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a', marginBottom: '16px' }}>3</div>
                <Title level={4}>Nhận Nhiệm vụ</Title>
                <Paragraph>
                  Xác nhận tham gia và nhận Link/Mã giới thiệu độc quyền để tích điểm
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        <Divider />

        {/* Scoring System */}
        <section className="scoring-section">
          <Title level={2} className="section-title">
            Cơ chế tính điểm
          </Title>
          <Paragraph style={{ marginBottom: '24px' }}>
            Điểm được ghi nhận tự động qua hệ thống Smart Contract theo 2 mốc:
          </Paragraph>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <Card style={{ textAlign: 'center', borderTop: '4px solid #52c41a' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#52c41a', marginBottom: '12px' }}>30</div>
                <Text style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '16px' }}>Điểm AF</Text>
                <Title level={5} style={{ marginBottom: '12px' }}>Mốc 1: Đăng ký thành công</Title>
                <Paragraph style={{ fontSize: '14px' }}>
                  Khi người được mời nhấp link, đăng ký tài khoản và hoàn tất xác minh danh tính (KYC)
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card style={{ textAlign: 'center', borderTop: '4px solid #1890ff' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1890ff', marginBottom: '12px' }}>+20</div>
                <Text style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '16px' }}>Điểm AF</Text>
                <Title level={5} style={{ marginBottom: '12px' }}>Mốc 2: Đăng tải sản phẩm</Title>
                <Paragraph style={{ fontSize: '14px' }}>
                  Khi người được mời đăng tải 1 sản phẩm hợp lệ (GPS, Watermark, qua kiểm duyệt)
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        <Divider />

        {/* Rewards & Redemption */}
        <section className="rewards-section">
          <Title level={2} className="section-title">
            Chương trình đổi điểm thưởng
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card style={{ backgroundColor: '#f0f5ff', border: '2px solid #1890ff', padding: '32px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '56px', fontWeight: 'bold', color: '#52c41a', marginBottom: '8px' }}>1 AF</div>
                    <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>= 1.000 VNĐ</Text>
                  </div>
                  
                  <Divider style={{ margin: '16px 0' }} />
                  
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Cách thức quy đổi:</Text>
                    <Paragraph style={{ marginTop: '12px', lineHeight: '1.8' }}>
                      Tất cả điểm AF tích lũy sẽ được quy đổi thành tiền mặt khi chiến dịch kết thúc. Mỗi 1 điểm AF = 1.000 VNĐ.
                    </Paragraph>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Thời gian chiến dịch:</Text>
                    <Paragraph style={{ marginTop: '12px', lineHeight: '1.8' }}>
                      <strong>Bắt đầu:</strong> 19/04/2026<br/>
                      <strong>Kết thúc:</strong> 19/06/2026
                    </Paragraph>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Đặc quyền Định danh:</Text>
                    <Paragraph style={{ marginTop: '12px', lineHeight: '1.8' }}>
                      100% tài khoản đạt mốc nhận huy hiệu "Sinh viên số" vĩnh viễn. Top BXH gia nhập "Biệt đội Sinh viên số" thực địa offline cùng Core Team.
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        <Divider />

        {/* Data Review & Violations */}
        <section className="compliance-section">
          <Title level={2} className="section-title">
            Rà soát Dữ liệu & Xử lý Vi phạm
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Điểm tạm tính:</Text>
                    <Paragraph style={{ marginTop: '8px' }}>
                      Điểm trên bảng xếp hạng (Leaderboard) là tạm tính. BQT Nông Lạc sẽ rà soát toàn diện trước khi chốt sổ.
                    </Paragraph>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Nghiêm cấm gian lận:</Text>
                    <Paragraph style={{ marginTop: '8px' }}>
                      Không sử dụng tool/bot, VPN/Proxy, tạo tài khoản ảo hoặc clone Device ID/IP.
                    </Paragraph>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#eb2f96' }}>Chế tài xử lý (Banned):</Text>
                    <Paragraph style={{ marginTop: '8px' }}>
                      Hủy toàn bộ thành tích, từ chối giải ngân và khóa tài khoản vĩnh viễn nếu AI Anti-Fraud phát hiện vi phạm. Quyết định của BQT là quyết định cuối cùng.
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        <Divider />

        {/* Terms & Conditions */}
        <section className="terms-section" ref={termsRef}>
          <Title level={2} className="section-title">
            Điều khoản thi hành & Chấp nhận Nhiệm vụ
          </Title>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Paragraph style={{ lineHeight: '1.8' }}>
                Quan hệ cộng tác hoàn toàn độc lập. Người tham gia tự chịu trách nhiệm kê khai Thuế TNCN (nếu phát sinh theo luật định). Thể lệ có hiệu lực ngay tại thời điểm đăng ký.
              </Paragraph>
              
              <Card style={{ backgroundColor: '#fafafa', border: '1px solid #e8e8e8' }}>
                <Paragraph style={{ marginBottom: '16px', lineHeight: '1.8' }}>
                  <strong>Tôi đã đọc, hiểu rõ và cam kết tuân thủ toàn bộ các nội dung của Thể lệ chiến dịch "Mùa Gặt Số - Tiếp thị liên kết"</strong>, đặc biệt là các quy định khắt khe về minh bạch dữ liệu và chống gian lận. Tôi đồng ý chịu mọi chế tài xử lý từ Nông Lạc nếu phát hiện vi phạm.
                </Paragraph>
                
                <Checkbox 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ fontSize: '16px' }}
                >
                  Tôi đồng ý với các điều khoản trên
                </Checkbox>
              </Card>

              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleRegisterAsStudent}
                  disabled={!agreed}
                  style={{ minWidth: '250px', height: '50px', fontSize: '16px' }}
                >
                  Đăng Ký Tài Khoản Sinh Viên
                </Button>
              </div>
            </Space>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer-section">
        <Paragraph className="text-center text-gray-600" style={{ marginBottom: 0 }}>
          © 2024 Nông Lạc. Chiến dịch Mùa Gặt Số. Tất cả quyền được bảo lưu.
        </Paragraph>
      </footer>
    </div>
  );
};

export default StudentAffiliateProgram;
