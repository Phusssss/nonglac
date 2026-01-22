import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Steps } from 'antd';
import { PhoneOutlined, SafetyOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import forgotPasswordService from '../../services/forgotPasswordService';
import logo from '../../assets/images/logo.demo.nontext.png';

const { Title, Text } = Typography;
const { Step } = Steps;

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  // Bước 1: Nhập số điện thoại và gửi OTP
  const handlePhoneSubmit = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await forgotPasswordService.sendPhoneOTP(values.phoneNumber);
      
      if (result.success) {
        setPhoneNumber(values.phoneNumber);
        setCurrentStep(1);
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleOtpSubmit = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await forgotPasswordService.verifyPhoneOTP(values.otpCode);
      
      if (result.success) {
        setCurrentStep(2);
        // Tự động gửi email reset
        await handleSendResetEmail();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Gửi email reset mật khẩu
  const handleSendResetEmail = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await forgotPasswordService.sendPasswordResetEmail();
      
      if (result.success) {
        setSuccess(result.message);
        // Reset service data
        forgotPasswordService.resetData();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await forgotPasswordService.sendPhoneOTP(phoneNumber);
      
      if (result.success) {
        setSuccess('Mã OTP mới đã được gửi');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            name="phone-form"
            onFinish={handlePhoneSubmit}
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50] hover:border-[#45a049]"
                style={{ height: 48, fontSize: 16 }}
              >
                {loading ? 'Đang tìm kiếm...' : 'Tìm tài khoản'}
              </Button>
            </Form.Item>
          </Form>
        );

      case 1:
        return (
          <Form
            name="otp-form"
            onFinish={handleOtpSubmit}
            layout="vertical"
            size="large"
          >
            <div className="text-center mb-4">
              <Text className="text-gray-600">
                Mã OTP đã được gửi đến số điện thoại: <strong>{phoneNumber}</strong>
              </Text>
            </div>

            <Form.Item
              name="otpCode"
              label="Mã OTP"
              rules={[
                { required: true, message: 'Vui lòng nhập mã OTP!' },
                { len: 6, message: 'Mã OTP phải có 6 chữ số!' }
              ]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="123456"
                maxLength={6}
                disabled={loading}
                style={{ textAlign: 'center', fontSize: 18, letterSpacing: 4 }}
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
                {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
              </Button>
            </Form.Item>

            <div className="text-center">
              <Text className="text-gray-600">Không nhận được mã? </Text>
              <Button 
                type="link" 
                onClick={handleResendOtp}
                disabled={loading}
                className="text-[#4CAF50] hover:text-[#45a049] p-0"
              >
                Gửi lại
              </Button>
            </div>
          </Form>
        );

      case 2:
        return (
          <div className="text-center">
            <MailOutlined style={{ fontSize: 64, color: '#4CAF50', marginBottom: 16 }} />
            <Title level={4} className="text-[#4CAF50] mb-4">
              Email đặt lại mật khẩu đã được gửi!
            </Title>
            <Text className="text-gray-600 block mb-6">
              Vui lòng kiểm tra hộp thư email của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
            </Text>
            <Button
              type="primary"
              onClick={() => navigate('/phone-login')}
              className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50] hover:border-[#45a049]"
              style={{ height: 48, fontSize: 16 }}
            >
              Quay lại đăng nhập
            </Button>
          </div>
        );

      default:
        return null;
    }
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
            Quên mật khẩu
          </Title>
          <Text className="text-gray-600">
            Nhập số điện thoại để đặt lại mật khẩu
          </Text>
        </div>

        {/* Steps indicator */}
        <Steps current={currentStep} size="small" className="mb-6">
          <Step title="Số điện thoại" icon={<PhoneOutlined />} />
          <Step title="Xác thực OTP" icon={<SafetyOutlined />} />
          <Step title="Gửi email" icon={<MailOutlined />} />
        </Steps>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {success && (
          <Alert
            message={success}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {renderStepContent()}

        {/* Back button */}
        <div className="text-center mt-6">
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/phone-login')}
            className="text-gray-600 hover:text-[#4CAF50]"
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;