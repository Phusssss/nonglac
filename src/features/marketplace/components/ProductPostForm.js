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
import { UploadOutlined } from '@ant-design/icons';
import { firebaseStorageService } from '../../../services/firebaseStorageService';
import { MARKETPLACE_CONSTANTS } from '../constants';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProductPostForm = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  const getCurrentCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
            accuracy: position.coords.accuracy || null,
            capturedAt: new Date().toISOString()
          });
        },
        () => {
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 120000
        }
      );
    });
  };

  const reverseGeocodeCoordinates = async (lat, lng) => {
    try {
      const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      const address = data?.address || {};

      const ward = address.suburb || address.quarter || address.village || address.hamlet || '';
      const district = address.city_district || address.district || address.county || '';
      const province = address.state || address.province || address.city || '';

      const compactParts = [ward, district, province].filter(Boolean);

      return {
        ward,
        district,
        province,
        country: address.country || '',
        displayName: compactParts.length > 0 ? compactParts.join(', ') : (data?.display_name || ''),
        fullAddress: data?.display_name || ''
      };
    } catch (error) {
      console.warn('Reverse geocode failed:', error);
      return null;
    }
  };

  const categories = (MARKETPLACE_CONSTANTS.PRODUCT_CATEGORIES || []).map((item) => ({
    value: item,
    label: item
  }));

  const units = [
    'kg', 'tấn', 'cây', 'cành', 'bó', 'thùng', 'bao', 'lít', 'chai', 'hộp'
  ];

  const handleImageUpload = async (file) => {
    if (file.size > 15 * 1024 * 1024) {
      message.error('Kích thước ảnh không được vượt quá 15MB');
      return false;
    }

    if (!file.type.startsWith('image/')) {
      message.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
      return false;
    }

    try {
      const uploadResult = await firebaseStorageService.uploadImage(file, {
        folder: 'marketplace-products',
        maxSizeMB: 10,
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
        outputType: 'image/jpeg'
      });
      const imageUrl = uploadResult.url;
      setImageUrls((prev) => [...prev, imageUrl]);
      message.success(`Upload ảnh ${file.name} thành công`);
      return false;
    } catch (error) {
      console.error('Image upload error:', error);
      if (error.code === 'storage/unauthorized') {
        message.error('Không có quyền upload ảnh. Vui lòng đăng nhập lại.');
      } else if (error.code === 'storage/quota-exceeded') {
        message.error('Vượt quá dung lượng lưu trữ. Vui lòng thử lại sau.');
      } else if (error.message) {
        message.error(`Upload thất bại: ${error.message}`);
      } else {
        message.error('Upload ảnh thất bại. Vui lòng thử lại.');
      }
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
      const locationCoords = await getCurrentCoordinates();
      let locationResolved = null;

      if (locationCoords) {
        locationResolved = await reverseGeocodeCoordinates(locationCoords.lat, locationCoords.lng);
      } else {
        message.warning('Không lấy được vị trí hiện tại. Sản phẩm vẫn được đăng bình thường.');
      }

      const productData = {
        ...values,
        images: imageUrls,
        locationCoords,
        locationResolved,
        locationLabel: locationResolved?.displayName || values.address || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await onSubmit(productData);
      form.resetFields();
      setImageUrls([]);
      message.success('Đăng sản phẩm thành công!');
    } catch (error) {
      console.error('Product submission error:', error);
      if (error.code === 'permission-denied') {
        message.error('Không có quyền đăng sản phẩm. Vui lòng đăng nhập lại.');
      } else if (error.code === 'network-request-failed') {
        message.error('Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.');
      } else if (error.message) {
        message.error(`Lỗi: ${error.message}`);
      } else {
        message.error('Có lỗi xảy ra, vui lòng thử lại');
      }
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
    <div style={{ width: '100%', padding: '8px 0' }}>
      <Card style={{ width: '100%' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          🌾 Đăng bán sản phẩm
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
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

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục" size="large">
                  {categories.map((cat) => (
                    <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
              >
                <Select placeholder="Chọn đơn vị" size="large">
                  {units.map((unit) => (
                    <Option key={unit} value={unit}>{unit}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="price"
                label="Giá bán"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  placeholder="0"
                  size="large"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => (value || '').replace(/,/g, '')}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
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

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="supplier"
                label="Tên người bán/Cơ sở"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Tên của bạn hoặc tên cơ sở" size="large" />
              </Form.Item>
            </Col>
            <Col span={24}>
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

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="Địa chỉ cụ thể (xã, huyện, tỉnh)" size="large" />
          </Form.Item>

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
                            setImageUrls((prev) => prev.filter((_, i) => i !== index));
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
