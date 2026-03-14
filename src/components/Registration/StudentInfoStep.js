import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, Row, Col, Select } from 'antd';
import { BookOutlined, IdcardOutlined } from '@ant-design/icons';
import registrationService from '../../services/registrationService';

const { Title, Text } = Typography;
const { Option } = Select;

const StudentInfoStep = ({ onNext, onBack, setLoading, setError, loading, error }) => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    // Danh sách các trường đại học phổ biến
    const universityList = [
      'Đại học Nông Lâm TP.HCM',
      'Đại học Nông Lâm Hà Nội',
      'Đại học Cần Thơ',
      'Đại học Kinh tế TP.HCM',
      'Đại học Kinh tế Hà Nội',
      'Đại học Bách Khoa TP.HCM',
      'Đại học Bách Khoa Hà Nội',
      'Đại học Quốc gia TP.HCM',
      'Đại học Quốc gia Hà Nội',
      'Trường Cao đẳng Nông Lâm',
      'Khác'
    ];
    setUniversities(universityList);
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = registrationService.saveStudentInfo({
        studentId: values.studentId?.trim(),
        university: values.university?.trim(),
        studentType: 'student'
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
        <Title level={4}>Thông tin sinh viên</Title>
        <Text type="secondary">Vui lòng nhập mã sinh viên và trường học</Text>
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
        name="student-info"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="studentId"
          label="Mã Sinh Viên"
          rules={[
            { required: true, message: 'Vui lòng nhập mã sinh viên!' },
            { min: 3, message: 'Mã sinh viên phải có ít nhất 3 ký tự!' },
            { max: 20, message: 'Mã sinh viên tối đa 20 ký tự!' }
          ]}
        >
          <Input
            prefix={<IdcardOutlined />}
            placeholder="VD: 20210001"
            disabled={loading}
            maxLength={20}
          />
        </Form.Item>

        <Form.Item
          name="university"
          label="Trường Đại Học / Cao Đẳng"
          rules={[{ required: true, message: 'Vui lòng chọn trường học!' }]}
        >
          <Select 
            placeholder="Chọn trường học của bạn" 
            disabled={loading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {universities.map((uni, index) => (
              <Option key={index} value={uni}>
                {uni}
              </Option>
            ))}
          </Select>
        </Form.Item>

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

export default StudentInfoStep;
