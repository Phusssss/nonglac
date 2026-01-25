import React from 'react';
import { Form, Input, Button, Typography, Alert, Space } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import registrationService from '../../services/registrationService';

const { Title, Text } = Typography;

const PhoneStep = ({ onNext, setLoading, setError, loading, error }) => {
  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = await registrationService.sendPhoneOTP(values.phoneNumber);
      
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
        <Title level={4}>Nhập số điện thoại</Title>
        <Text type="secondary">
          Vui lòng nhập số điện thoại để bắt đầu đăng ký
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
        name="phone-step"
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

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50] hover:border-[#45a049]"
            >
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </Button>
          </div>
        </Form.Item>
      </Form>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default PhoneStep;