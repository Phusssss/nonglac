import React from 'react';
import { Form, Input, Button, Typography, Alert, Space } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import registrationService from '../../services/registrationService';

const { Title, Text } = Typography;

const OTPStep = ({ onNext, onBack, setLoading, setError, loading, error }) => {
  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = await registrationService.verifyPhoneOTP(values.otpCode);
      
      if (result.success) {
        onNext();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={4}>Nhập mã OTP</Title>
        <Text type="secondary">
          Mã xác thực đã được gửi đến số điện thoại của bạn
        </Text>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        name="otp-step"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={onBack}
              disabled={loading}
              size="large"
            >
              Quay lại
            </Button>
            
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50] hover:border-[#45a049]"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OTPStep;