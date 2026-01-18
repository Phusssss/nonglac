import React from 'react';
import { Modal, Button, Typography, Space, Divider } from 'antd';
import { LoginOutlined, UserAddOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.demo.nontext.png';

const { Title, Text, Paragraph } = Typography;

const EnhancedLoginModal = ({ 
  open, 
  onCancel, 
  message, 
  feature,
  title = "Đăng nhập để tiếp tục"
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Lưu thông tin để redirect sau khi login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    if (message) {
      localStorage.setItem('loginMessage', message);
    }
    navigate('/phone-login');
    onCancel();
  };

  const handleRegister = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/phone-register');
    onCancel();
  };

  const benefits = [
    { icon: <CheckCircleOutlined />, text: 'Tạo và chia sẻ bài viết nông nghiệp' },
    { icon: <CheckCircleOutlined />, text: 'Kết nối với cộng đồng nông dân' },
    { icon: <CheckCircleOutlined />, text: 'Sử dụng AI hỗ trợ nông nghiệp' },
    { icon: <CheckCircleOutlined />, text: 'Mua bán nông sản trực tuyến' }
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={480}
      styles={{
        body: { padding: '32px' }
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img 
          src={logo} 
          alt="NôngLạc Logo" 
          style={{ height: 64, marginBottom: 16 }}
        />
        <Title level={3} style={{ marginBottom: 8, color: '#262626' }}>
          {title}
        </Title>
        <Text type="secondary">
          {message || `Bạn cần đăng nhập để ${feature || 'sử dụng tính năng này'}`}
        </Text>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {benefits.map((benefit, index) => (
            <Space key={index} align="start">
              <span style={{ color: '#52c41a', fontSize: 16 }}>
                {benefit.icon}
              </span>
              <Text style={{ fontSize: 14 }}>{benefit.text}</Text>
            </Space>
          ))}
        </Space>
      </div>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Button
          type="primary"
          size="large"
          icon={<LoginOutlined />}
          onClick={handleLogin}
          block
          style={{
            height: 48,
            backgroundColor: '#52c41a',
            borderColor: '#52c41a'
          }}
        >
          Đăng nhập
        </Button>
        
        <Button
          size="large"
          icon={<UserAddOutlined />}
          onClick={handleRegister}
          block
          style={{ height: 48 }}
        >
          Tạo tài khoản mới
        </Button>
      </Space>

      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate('/terms-of-service')}
            style={{ padding: 0, fontSize: 12, color: '#52c41a' }}
          >
            Điều khoản dịch vụ
          </Button>
          {' '}và{' '}
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate('/privacy')}
            style={{ padding: 0, fontSize: 12, color: '#52c41a' }}
          >
            Chính sách bảo mật
          </Button>
        </Text>
      </div>
    </Modal>
  );
};

export default EnhancedLoginModal;