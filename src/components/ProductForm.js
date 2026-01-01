import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Upload, Button, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import GitHubImageUpload from './GitHubImageUpload';


const { TextArea } = Input;
const { Option } = Select;

const ProductForm = ({ visible, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const productTypes = [
    'Lúa gạo', 'Ngô', 'Khoai lang', 'Khoai tây', 'Sắn',
    'Cà phê', 'Cao su', 'Tiêu', 'Điều', 'Dừa',
    'Xoài', 'Chuối', 'Cam', 'Bưởi', 'Nhãn',
    'Rau xanh', 'Rau củ', 'Gia vị', 'Hoa màu',
    'Tôm', 'Cá', 'Thủy sản khác'
  ];

  const units = ['kg', 'tấn', 'tạ', 'yến', 'con', 'thùng', 'bao'];

  const provinces = [
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình',
    'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
    'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
    'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long',
    'Vĩnh Phúc', 'Yên Bái', 'Phú Yên', 'Cần Thơ', 'Đà Nẵng',
    'Hải Phòng', 'Hà Nội', 'TP. Hồ Chí Minh'
  ];

  const handleSubmit = async (values) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để đăng sản phẩm!');
      return;
    }

    if (images.length === 0) {
      message.error('Vui lòng thêm ít nhất 1 hình ảnh!');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...values,
        images,
        sellerId: user.uid,
        sellerName: user.displayName || user.email,
        sellerPhone: values.phone,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'products'), productData);
      message.success('Đăng sản phẩm thành công!');
      form.resetFields();
      setImages([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      message.error('Lỗi khi đăng sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      title="Đăng bán sản phẩm nông nghiệp"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          unit: 'kg'
        }}
      >
        <Form.Item
          name="productType"
          label="Loại nông sản"
          rules={[{ required: true, message: 'Vui lòng chọn loại nông sản!' }]}
        >
          <Select
            placeholder="Chọn hoặc tìm kiếm loại nông sản"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {productTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="productName"
          label="Tên sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
        >
          <Input placeholder="VD: Lúa ST25, Cà phê Robusta..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Mô tả chi tiết về sản phẩm, chất lượng, nguồn gốc..."
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="quantity"
            label="Sản lượng"
            rules={[{ required: true, message: 'Vui lòng nhập sản lượng!' }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              placeholder="Số lượng"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Chọn đơn vị">
              {units.map(unit => (
                <Option key={unit} value={unit}>{unit}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              placeholder="Giá bán"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="location"
          label="Địa chỉ"
          rules={[{ required: true, message: 'Vui lòng chọn địa chỉ!' }]}
        >
          <Select
            placeholder="Chọn hoặc tìm kiếm tỉnh/thành phố"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {provinces.map(province => (
              <Option key={province} value={province}>{province}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại liên hệ"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
          ]}
        >
          <Input placeholder="VD: 0901234567" />
        </Form.Item>

        <Form.Item label="Hình ảnh sản phẩm" required>
          <div style={{ marginBottom: 16 }}>
            <GitHubImageUpload onUploadComplete={handleImageUpload} />
            {images.length < 10 && (
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                style={{ marginTop: 8 }}
              >
                Thêm ảnh khác ({images.length}/10)
              </Button>
            )}
          </div>
          
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {images.map((image, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9'
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      minWidth: '24px'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Đăng sản phẩm
            </Button>
            <Button onClick={onClose}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;