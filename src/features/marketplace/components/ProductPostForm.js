import React, { useState, useEffect } from 'react';
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
  Typography,
  Checkbox,
  Spin
} from 'antd';
import { 
  UploadOutlined, 
  InfoCircleOutlined, 
  DollarCircleOutlined, 
  ContactsOutlined, 
  PictureOutlined,
  PlusOutlined
} from '@ant-design/icons';
import ProfileInfoModal from '../../../components/ProfileInfoModal';
import { MISSIONS_CONSTANTS } from '../../missions/constants';
import { firebaseStorageService } from '../../../services/firebaseStorageService';
import { MARKETPLACE_CONSTANTS } from '../constants';
import { useAuth } from '../../../hooks/useAuth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProductPostForm = ({ onSubmit, onCancel }) => {
  const { user, userProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [farmAddresses, setFarmAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressModalLoading, setAddressModalLoading] = useState(false);

  // Load farm addresses từ user profile
  useEffect(() => {
    if (!user?.uid) {
      setLoadingAddresses(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setFarmAddresses(data.farmAddresses || []);
      }
      setLoadingAddresses(false);
    });

    return () => unsub();
  }, [user?.uid]);

  // Auto-fill phone and supplier
  useEffect(() => {
    if (userProfile || user) {
      const currentValues = form.getFieldsValue(['supplier', 'phone', 'contactMethods']);
      if (!form.isFieldsTouched(['supplier', 'phone'])) {
        form.setFieldsValue({
          supplier: currentValues.supplier || userProfile?.displayName || user?.displayName || '',
          phone: currentValues.phone || userProfile?.phone || user?.phoneNumber || userProfile?.phoneNumber || '',
          contactMethods: currentValues.contactMethods || ['phone']
        });
      }
    }
  }, [userProfile, user, form]);

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

  const handleImageUpload = (file) => {
    if (file.size > 15 * 1024 * 1024) {
      message.error('Kích thước ảnh không được vượt quá 15MB');
      return false;
    }

    if (!file.type.startsWith('image/')) {
      message.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
      return false;
    }

    const newImage = {
      file,
      previewUrl: URL.createObjectURL(file)
    };
    
    setImageFiles((prev) => [...prev, newImage]);
    return false; // Prevent automatic upload
  };

  const handleSubmit = async (values) => {
    if (imageFiles.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 ảnh sản phẩm');
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

      // Upload images concurrently
      const uploadPromises = imageFiles.map((img) => 
        firebaseStorageService.uploadImage(img.file, {
          folder: 'marketplace-products',
          maxSizeMB: 10
        })
      );
      const uploadResults = await Promise.all(uploadPromises);
      const finalImageUrls = uploadResults.map(res => res.url);

      const productData = {
        ...values,
        images: finalImageUrls,
        locationCoords,
        locationResolved,
        locationLabel: locationResolved?.displayName || values.address || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await onSubmit(productData);
      form.resetFields();
      
      // Cleanup preview URLs
      imageFiles.forEach(img => URL.revokeObjectURL(img.previewUrl));
      setImageFiles([]);
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="marketplace-form"
        >
          <div className="marketplace-form-section-title">
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Thông tin cơ bản
          </div>

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
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
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

          <div className="marketplace-form-section-title">
            <DollarCircleOutlined style={{ marginRight: 8 }} />
            Giá & Số lượng
          </div>


          <Row gutter={16}>
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
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

          <div className="marketplace-form-section-title">
            <ContactsOutlined style={{ marginRight: 8 }} />
            Nhà cung cấp & Liên hệ
          </div>
          <Row gutter={16}>
            <Col xs={24} sm={12}>

              <Form.Item
                name="supplier"
                label="Tên người bán/Cơ sở"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Tên của bạn hoặc tên cơ sở" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>

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
            <Col span={24}>
              <Form.Item
                name="contactMethods"
                label="Phương thức liên hệ"
                rules={[{ required: true, message: 'Vui lòng chọn ít nhất một phương thức liên hệ' }]}
              >
                <Checkbox.Group>
                  <Row gutter={[16, 8]}>
                    <Col xs={12} sm={8}>
                      <Checkbox value="phone">📞 Gọi điện</Checkbox>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Checkbox value="sms">💬 SMS</Checkbox>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Checkbox value="zalo">👥 Zalo</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Col>
          </Row>

          <div className="marketplace-form-section-title">
            <PictureOutlined style={{ marginRight: 8 }} />
            Hình ảnh & Địa chỉ
          </div>


          <Form.Item
            name="address"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span>Địa chỉ canh tác</span>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<PlusOutlined />} 
                  onClick={() => setAddressModalOpen(true)}
                  style={{ padding: 0, height: 'auto', fontSize: '13px' }}
                >
                  Thêm mới
                </Button>
              </div>
            }
            rules={[{ required: true, message: 'Vui lòng chọn địa chỉ' }]}
          >
            <Select 
              placeholder="Chọn địa chỉ canh tác" 
              size="large"
              loading={loadingAddresses}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '8px' }}>
                    <Button 
                      type="text" 
                      block 
                      icon={<PlusOutlined />} 
                      onClick={() => setAddressModalOpen(true)}
                      style={{ textAlign: 'left', color: '#4CAF50', fontWeight: 500 }}
                    >
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                </>
              )}
              notFoundContent={
                loadingAddresses ? <Spin size="small" /> : 
                farmAddresses.length === 0 ? 
                  <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>
                      Bạn chưa có địa chỉ canh tác nào
                    </div>
                    <Button 
                      type="primary" 
                      ghost 
                      size="small" 
                      icon={<PlusOutlined />}
                      onClick={() => setAddressModalOpen(true)}
                    >
                      Tạo địa chỉ ngay
                    </Button>
                  </div> : 
                  undefined
              }
              optionLabelProp="label"
            >
              {farmAddresses.map((address, index) => (
                <Select.Option 
                  key={address.id || index} 
                  value={address.address}
                  label={`${address.address} (${address.farmType})`}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{address.address}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {address.farmType}
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Hình ảnh sản phẩm (Tối đa 5 ảnh)" required>
            <Upload {...uploadProps}>
              <div className="marketplace-upload-zone">
                <UploadOutlined style={{ fontSize: 28, color: '#4CAF50', marginBottom: 12 }} />
                <div style={{ fontWeight: 600, color: '#334155' }}>
                  {imageFiles.length === 0 ? 'Tải ảnh lên hoặc kéo thả' : `${imageFiles.length} ảnh đã chọn`}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Chấp nhận JPG, PNG (Tối đa 15MB)
                </div>
              </div>
            </Upload>


            {imageFiles.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Row gutter={[8, 8]}>
                  {imageFiles.map((img, index) => (
                    <Col key={index} span={6}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={img.previewUrl}
                          alt={`Product ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '2px solid #4CAF50'
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
                            URL.revokeObjectURL(img.previewUrl);
                            setImageFiles((prev) => prev.filter((_, i) => i !== index));
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

          <Form.Item style={{ marginTop: 40, marginBottom: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <Button size="large" onClick={onCancel} style={{ borderRadius: 8 }}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  background: '#4CAF50',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16
                }}
              >
                Đăng sản phẩm ngay
              </Button>
            </div>
          </Form.Item>
        </Form>


      <ProfileInfoModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSubmit={async (formData) => {
          setAddressModalLoading(true);
          try {
            if (formData.farmAddresses && Array.isArray(formData.farmAddresses)) {
              await updateDoc(doc(db, 'users', user.uid), {
                farmAddresses: formData.farmAddresses,
                updatedAt: new Date()
              });
              message.success('Đã cập nhật địa chỉ canh tác!');
              setAddressModalOpen(false);
            }
          } catch (error) {
            console.error('Error updating addresses:', error);
            message.error('Không thể lưu địa chỉ. Vui lòng thử lại.');
          } finally {
            setAddressModalLoading(false);
          }
        }}
        title="Quản lý địa chỉ canh tác"
        fields={[{
          ...MISSIONS_CONSTANTS.MODAL_CONFIGS.FARM_ADDRESS.fields[0],
          initialValue: farmAddresses
        }]}
        loading={addressModalLoading}
        initialFarmAddresses={farmAddresses}
      />
    </div>
  );
};

export default ProductPostForm;
