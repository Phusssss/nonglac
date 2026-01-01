import React from 'react';
import { Form, Input, Button, Typography, Alert, Row, Col, Select, DatePicker } from 'antd';
import { UserOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import registrationService from '../../services/registrationService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PersonalInfoStep = ({ onNext, onBack, setLoading, setError, loading, error }) => {
  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const formData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : ''
      };
      
      const result = registrationService.savePersonalInfo(formData);
      
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
        <Title level={4}>Thông tin cá nhân</Title>
        <Text type="secondary">
          Vui lòng nhập thông tin cá nhân của bạn
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
        name="personal-info"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="displayName"
          label="Họ và tên"
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên!' },
            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Nguyễn Văn A"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="example@email.com"
            disabled={loading}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày sinh"
                disabled={loading}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="gender"
              label="Giới tính"
            >
              <Select
                placeholder="Chọn giới tính"
                disabled={loading}
              >
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <TextArea
            prefix={<HomeOutlined />}
            placeholder="Nhập địa chỉ của bạn"
            rows={3}
            disabled={loading}
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
              {loading ? 'Đang lưu...' : 'Tiếp tục'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PersonalInfoStep;