import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Spin, message, Tooltip, Row, Col, Statistic } from 'antd';
import { CopyOutlined, LinkOutlined, QrcodeOutlined, CheckOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';
import referralService from '../../../services/referralService';
import { useAuth } from '../../../hooks/useAuth';
import './StudentReferralSection.css';

const StudentReferralSection = () => {
  const { user, userProfile } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferred: 0,
    successfulReferred: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const qrRef = React.useRef();

  useEffect(() => {
    loadReferralInfo();
  }, [user?.uid]);

  const generateQRCode = async (link) => {
    try {
      const dataUrl = await QRCode.toDataURL(link, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 200,
        color: {
          dark: '#2E7D32',
          light: '#ffffff'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      message.error('Không thể tạo mã QR');
    }
  };

  const loadReferralInfo = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Lấy hoặc tạo mã giới thiệu
      const codeResult = await referralService.getOrCreateReferralCode(
        user.uid,
        userProfile?.displayName || 'Student'
      );

      if (codeResult.success) {
        setReferralCode(codeResult.referralCode);
        const link = referralService.generateReferralLink(codeResult.referralCode);
        setReferralLink(link);
        // Tạo QR code
        await generateQRCode(link);
      }

      // Lấy thông tin thống kê
      const statsResult = await referralService.getReferralInfo(user.uid);
      if (statsResult.success) {
        setReferralStats(statsResult.referralStats);
      }
    } catch (error) {
      console.error('Error loading referral info:', error);
      message.error('Không thể tải thông tin giới thiệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    setCopying(true);
    const result = await referralService.copyToClipboard(referralCode);
    if (result.success) {
      message.success('Đã copy mã giới thiệu!');
    } else {
      message.error('Không thể copy');
    }
    setCopying(false);
  };

  const handleCopyLink = async () => {
    setCopying(true);
    const result = await referralService.copyToClipboard(referralLink);
    if (result.success) {
      message.success('Đã copy link giới thiệu!');
    } else {
      message.error('Không thể copy');
    }
    setCopying(false);
  };

  const handleDownloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `referral-${referralCode}.png`;
      link.click();
    }
  };

  if (loading) {
    return (
      <Card className="student-referral-section">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="student-referral-section">
      <div className="referral-header">
        <h2 className="referral-title">
          <LinkOutlined /> Chương Trình Giới Thiệu Sinh Viên
        </h2>
        <p className="referral-subtitle">
          Chia sẻ mã giới thiệu của bạn và kiếm tiền từ mỗi bạn bè đăng ký thành công
        </p>
      </div>

      {/* Thống kê */}
      <Row gutter={[16, 16]} className="referral-stats">
        <Col xs={24} sm={8}>
          <Statistic
            title="Tổng Giới Thiệu"
            value={referralStats.totalReferred}
            prefix={<span className="stat-icon">👥</span>}
            valueStyle={{ color: '#4CAF50' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Đăng Ký Thành Công"
            value={referralStats.successfulReferred}
            prefix={<span className="stat-icon">✓</span>}
            valueStyle={{ color: '#2E7D32' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Tổng Thu Nhập"
            value={referralStats.totalEarnings}
            suffix="đ"
            prefix={<span className="stat-icon">💰</span>}
            valueStyle={{ color: '#FFD700' }}
            formatter={(value) => {
              return new Intl.NumberFormat('vi-VN').format(value);
            }}
          />
        </Col>
      </Row>

      {/* Mã Giới Thiệu */}
      <div className="referral-code-section">
        <h3 className="section-subtitle">Mã Giới Thiệu Của Bạn</h3>
        <div className="code-display">
          <div className="code-box">
            <span className="code-text">{referralCode}</span>
            <Tooltip title="Copy mã">
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={handleCopyCode}
                loading={copying}
                className="copy-button"
              />
            </Tooltip>
          </div>
          <p className="code-hint">Chia sẻ mã này với bạn bè để họ nhập khi đăng ký</p>
        </div>
      </div>

      {/* Link Giới Thiệu */}
      <div className="referral-link-section">
        <h3 className="section-subtitle">Link Giới Thiệu</h3>
        <div className="link-display">
          <div className="link-box">
            <span className="link-text">{referralLink}</span>
            <Tooltip title="Copy link">
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={handleCopyLink}
                loading={copying}
                className="copy-button"
              />
            </Tooltip>
          </div>
          <p className="link-hint">Chia sẻ link này trực tiếp với bạn bè</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="referral-qr-section">
        <h3 className="section-subtitle">Mã QR Giới Thiệu</h3>
        <div className="qr-container">
          <div className="qr-display" ref={qrRef}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
            ) : (
              <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin />
              </div>
            )}
          </div>
          <p className="qr-hint">Quét mã QR để truy cập link giới thiệu</p>
        </div>
      </div>

      {/* Nút Hành Động */}
      <div className="referral-actions">
        <Space wrap>
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={handleCopyCode}
            loading={copying}
            className="action-button"
          >
            Copy Mã
          </Button>
          <Button
            icon={<LinkOutlined />}
            onClick={handleCopyLink}
            loading={copying}
            className="action-button"
          >
            Copy Link
          </Button>
          <Button
            icon={<QrcodeOutlined />}
            onClick={() => setShowQR(!showQR)}
            className="action-button"
          >
            {showQR ? 'Ẩn QR' : 'Hiện QR'}
          </Button>
          <Button
            icon={<CheckOutlined />}
            onClick={handleDownloadQR}
            className="action-button"
          >
            Tải QR
          </Button>
        </Space>
      </div>

      {/* Hướng Dẫn */}
      <div className="referral-guide">
        <h3 className="section-subtitle">Cách Sử Dụng</h3>
        <ol className="guide-list">
          <li>Sao chép mã giới thiệu hoặc link của bạn</li>
          <li>Chia sẻ với bạn bè qua email, tin nhắn, hoặc mạng xã hội</li>
          <li>Khi bạn bè đăng ký sử dụng mã/link của bạn, bạn sẽ nhận được phần thưởng</li>
          <li>Theo dõi số lượng giới thiệu thành công và thu nhập của bạn ở trên</li>
        </ol>
      </div>

      {/* Điều Khoản */}
      <div className="referral-terms">
        <h3 className="section-subtitle">Điều Khoản & Điều Kiện</h3>
        <ul className="terms-list">
          <li>Mỗi bạn bè đăng ký thành công, bạn nhận 50,000đ</li>
          <li>Bonus 100,000đ khi giới thiệu 5 bạn bè thành công</li>
          <li>Tiền thưởng sẽ được cộng vào tài khoản của bạn</li>
          <li>Bạn bè phải hoàn thành xác thực tài khoản để được tính là đăng ký thành công</li>
        </ul>
      </div>
    </Card>
  );
};

export default StudentReferralSection;
