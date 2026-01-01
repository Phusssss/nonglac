import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Result } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import registrationService from '../../services/registrationService';

const { Title, Text } = Typography;

const PasswordStep = ({ onBack, onReset, setLoading, setError, loading, error }) => {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = await registrationService.createSimpleAccount(values.password);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Result
        status="success"
        title="Đăng ký thành công!"
        subTitle="Tài khoản của bạn đã được tạo thành công. Đang chuyển hướng về trang chủ..."
        className="text-center"
      />
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <Title level={4}>Tạo mật khẩu</Title>
        <Text className="text-gray-600">
          Tạo mật khẩu để hoàn tất đăng ký. Bạn có thể bổ sung thông tin sau trong phần nhiệm vụ.
        </Text>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Form
        name="password-step"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận mật khẩu"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            disabled={loading}
          />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-between">
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
              {loading ? 'Đang tạo...' : 'Hoàn tất đăng ký'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PasswordStep;