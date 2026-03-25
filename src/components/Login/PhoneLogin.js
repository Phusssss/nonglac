import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, Modal } from 'antd';
import { PhoneOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import registrationService from '../../services/registrationService';
import termsService from '../../services/termsService';
import { authRedirectService } from '../../services/authRedirectService';
import { ErrorDisplay } from '../common';
import { normalizeVietnameseText } from '../../constants/errorMessages';
import logo from '../../assets/images/logo.demo.nontext.png';

const { Title, Text, Link } = Typography;

const PhoneLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginMessage, setLoginMessage] = useState('');
  const [termsData, setTermsData] = useState(null);
  const navigate = useNavigate();

  // Xóa toàn bộ dữ liệu đăng nhập khi truy cập trang đăng nhập
  useEffect(() => {
    // Reset dữ liệu trong service
    registrationService.resetRegistrationData();
    
    // Xóa localStorage
    localStorage.removeItem('loginMessage');
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('loginFeature');
    localStorage.removeItem('nonglac_user_context');
    localStorage.removeItem('nonglac_chat_history');
    
    // Đăng xuất khỏi Firebase để xóa session
    signOut(auth).catch(() => {
      // Bỏ qua lỗi nếu chưa đăng nhập
    });
  }, []);

  // Hiển thị message từ redirect
  useEffect(() => {
    const message = localStorage.getItem('loginMessage');
    if (message) {
      setLoginMessage(normalizeVietnameseText(message));
    }
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registrationService.signInWithPhone(
        values.phoneNumber,
        values.password
      );

      if (result.success) {
        // Check xem user đã đồng ý điều khoản chưa
        const userDoc = await registrationService.getUserData(result.userId);
        
        if (!userDoc?.termsAgreement) {
          // Hiển thị modal yêu cầu đồng ý điều khoản
          Modal.confirm({
            title: 'Đồng ý Điều khoản Sử dụng',
            content: (
              <div>
                <p>Để tiếp tục sử dụng Nonglac.com, bạn cần đồng ý với:</p>
                <ul style={{ marginTop: '10px' }}>
                  <li>
                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
                      Điều khoản sử dụng
                    </a>
                  </li>
                  <li>
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                      Chính sách bảo mật
                    </a>
                  </li>
                </ul>
              </div>
            ),
            okText: 'Đồng ý',
            cancelText: 'Từ chối',
            onOk: async () => {
              // Lấy IP và lưu vào user document
              const ip = await termsService.getClientIpAddress();
              await updateDoc(doc(db, 'users', result.userId), {
                termsAgreement: {
                  agreedAt: new Date(),
                  ipAddress: ip,
                  version: termsService.CURRENT_VERSION,
                  userAgent: navigator.userAgent || 'unknown'
                }
              });
              // Tiếp tục redirect
              authRedirectService.handlePostLoginRedirect(navigate);
            },
            onCancel: () => {
              // User từ chối, đăng xuất
              signOut(auth);
              setError('Bạn phải đồng ý với điều khoản sử dụng để tiếp tục');
            }
          });
        } else {
          // Đã đồng ý rồi, tiếp tục redirect
          authRedirectService.handlePostLoginRedirect(navigate);
        }
      } else {
        setError(normalizeVietnameseText(result.message));
      }
    } catch (caughtError) {
      setError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card
        className="w-full max-w-md"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="text-center mb-8">
          <img src={logo} alt="NôngLạc Logo" className="h-16 w-auto mx-auto mb-4" />
          <Title level={2} className="text-[#4CAF50] mb-2">
            Đăng nhập
          </Title>
          <Text className="text-gray-600">
            {loginMessage || 'Đăng nhập bằng số điện thoại và mật khẩu'}
          </Text>
        </div>

        {error && (
          <ErrorDisplay
            error={error}
            onRetry={handleRetry}
            showRetry
            showSupport
            className="mb-4"
          />
        )}

        <Form
          name="phone-login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9+]{10,12}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="0395752407"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50] hover:border-[#45a049]"
              style={{ height: 48, fontSize: 16 }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center space-y-3">
          <div>
            <Space>
              <Text className="text-gray-600">Chưa có tài khoản?</Text>
              <Link
                onClick={() => navigate('/phone-register')}
                className="text-[#4CAF50] hover:text-[#45a049]"
              >
                Đăng ký ngay
              </Link>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PhoneLogin;
