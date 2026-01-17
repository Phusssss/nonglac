import React, { useState } from 'react';
import { 
  Card, 
  Form,
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  InputNumber,
  Upload,
  message,
  Space,
  Typography
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { githubStorage } from '../../services/githubStorage';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProductPostForm = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  const categories = [
    { value: 'flowers', label: 'Hoa cắt cành' },
    { value: 'fruits', label: 'Trái cây' },
    { value: 'meat_seafood', label: 'Thịt & Hải sản' },
    { value: 'vegetables', label: 'Rau củ & Nấm' }
  ];

  const units = [
    'kg', 'tấn', 'cây', 'cành', 'bó', 'thùng', 'bao', 'lít', 'chai', 'hộp'
  ];

  const handleImageUpload = async (file) => {
    try {
      const imageUrl = await githubStorage.uploadImage(file, 'marketplace-products');
      setImageUrls(prev => [...prev, imageUrl]);
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('Upload ảnh thất bại');
      return false;
    }
  };

  const handleSubmit = async (values) => {
    if (imageUrls.length === 0) {
      message.error('Vui lòng upload ít nhất 1 ảnh sản phẩm');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...values,
        imageUrls,
        images: imageUrls, // For compatibility
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await onSubmit(productData);
      form.resetFields();
      setImageUrls([]);
      message.success('Đăng sản phẩm thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: handleImageUpload,
    showUploadList: false,
    multiple: true,
    accept: 'image/*'
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          🌾 Đăng bán sản phẩm
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* Tên sản phẩm */}
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input 
              placeholder="VD: Cà chua bi sạch Đà Lạt"
              size="large"
            />
          </Form.Item>

          {/* Danh mục & Đơn vị */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục" size="large">
                  {categories.map(cat => (
                    <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
              >
                <Select placeholder="Chọn đơn vị" size="large">
                  {units.map(unit => (
                    <Option key={unit} value={unit}>{unit}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Giá & Số lượng */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá bán"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  placeholder="0"
                  size="large"
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Số lượng có sẵn"
              >
                <InputNumber
                  placeholder="0"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Mô tả */}
          <Form.Item
            name="description"
            label="Mô tả sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về sản phẩm: chất lượng, nguồn gốc, đặc điểm..."
            />
          </Form.Item>

          {/* Thông tin liên hệ */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Tên người bán/Cơ sở"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Tên của bạn hoặc tên cơ sở" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input placeholder="0123456789" size="large" />
              </Form.Item>
            </Col>
          </Row>

          {/* Địa chỉ */}
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="Địa chỉ cụ thể (xã, huyện, tỉnh)" size="large" />
          </Form.Item>

          {/* Upload ảnh */}
          <Form.Item label="Hình ảnh sản phẩm" required>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} size="large" block>
                Chọn ảnh ({imageUrls.length} ảnh đã chọn)
              </Button>
            </Upload>
            
            {imageUrls.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Row gutter={[8, 8]}>
                  {imageUrls.map((url, index) => (
                    <Col key={index} span={6}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '2px solid #52c41a'
                          }}
                        />
                        <Button
                          type="primary"
                          danger
                          size="small"
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            width: 20,
                            height: 20,
                            padding: 0,
                            minWidth: 20
                          }}
                          onClick={() => {
                            setImageUrls(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Form.Item>

          {/* Buttons */}
          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button size="large" onClick={onCancel}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                  border: 'none',
                  minWidth: 120
                }}
              >
                Đăng sản phẩm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProductPostForm;