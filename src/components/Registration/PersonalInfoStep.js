import React from 'react';
import { Form, Input, Button, Typography, Alert, Row, Col, Select, InputNumber } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import registrationService from '../../services/registrationService';

const { Title, Text } = Typography;
const { Option } = Select;

const PersonalInfoStep = ({ onNext, onBack, setLoading, setError, loading, error }) => {
  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = registrationService.savePersonalInfo({
        displayName: values.displayName?.trim(),
        gender: values.gender,
        age: Number(values.age)
      });

      if (result.success) {
        onNext();
      } else {
        setError(result.message);
      }
    } catch (_error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={4}>Thông tin cơ bản</Title>
        <Text type="secondary">Vui lòng nhập tên người dùng, giới tính và tuổi</Text>
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
          label="Tên người dùng"
          rules={[
            { required: true, message: 'Vui lòng nhập tên người dùng!' },
            { min: 2, message: 'Tên người dùng phải có ít nhất 2 ký tự!' },
            { max: 30, message: 'Tên người dùng tối đa 30 ký tự!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="VD: NongDanDakLak"
            disabled={loading}
            maxLength={30}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
            >
              <Select placeholder="Chọn giới tính" disabled={loading}>
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="age"
              label="Tuổi"
              rules={[
                { required: true, message: 'Vui lòng nhập tuổi!' },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) {
                      return Promise.reject(new Error('Vui lòng nhập tuổi!'));
                    }
                    if (!Number.isInteger(Number(value))) {
                      return Promise.reject(new Error('Tuổi phải là số nguyên!'));
                    }
                    if (Number(value) < 13 || Number(value) > 120) {
                      return Promise.reject(new Error('Tuổi phải trong khoảng 13-120!'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={13}
                max={120}
                placeholder="VD: 25"
                disabled={loading}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onBack} disabled={loading} size="large">
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
