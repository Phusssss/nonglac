import React, { useState, useRef } from 'react';
import { Form, Input, Button, Typography, Alert, Result, Checkbox, Space, Spin } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import registrationService from '../../services/registrationService';
import termsService from '../../services/termsService';

const { Title, Text } = Typography;

const PasswordStep = ({ onBack, onReset, setLoading, setError, loading, error }) => {
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  const [fetchingIp, setFetchingIp] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      // Validate form trước
      await form.validateFields();
      
      // Lấy IP khi bấm nút hoàn tất
      setFetchingIp(true);
      console.log('📍 Fetching IP address...');
      const ipAddress = await termsService.getClientIpAddress();
      console.log('✓ IP obtained:', ipAddress);
      setFetchingIp(false);

      // Bắt buộc phải lấy được IP (không phải N/A)
      if (!ipAddress || ipAddress === 'N/A') {
        setError('Không thể lấy địa chỉ IP. Vui lòng kiểm tra kết nối mạng và thử lại.');
        setLoading(false);
        return;
      }

      const termsData = {
        agreedAt: new Date(),
        ipAddress: ipAddress,
        version: termsService.CURRENT_VERSION,
        userAgent: navigator.userAgent || 'unknown'
      };

      const result = await registrationService.createSimpleAccount(values.password, termsData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
      setFetchingIp(false);
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
        form={form}
        name="password-step"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        validateTrigger="onBlur"
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

        <Form.Item
          name="termsAgreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) => {
                if (value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật'));
              },
            },
          ]}
        >
          <Checkbox>
            <span className="text-sm">
              Tôi đã đọc và đồng ý với{' '}
              <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-[#4CAF50] hover:text-[#45a049]">
                Điều khoản sử dụng
              </a>
              {' '}và{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#4CAF50] hover:text-[#45a049]">
                Chính sách bảo mật
              </a>
              {' '}của Nonglac.com
            </span>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <div className="flex justify-between">
            <Button
              onClick={onBack}
              disabled={loading || fetchingIp}
              size="large"
            >
              Quay lại
            </Button>
            
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || fetchingIp}
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