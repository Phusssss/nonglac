import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Typography, Alert, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import vietnamAddressService from '../../services/vietnamAddressService';
import { verifyLocation } from '../../data/vietnamLocations';

const { Title, Text } = Typography;
const { Option } = Select;

const ProfileCompletionModal = ({ visible, onClose, onComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  React.useEffect(() => {
    if (visible) {
      loadProvinces();
    }
  }, [visible]);

  const loadProvinces = async () => {
    try {
      const provincesData = await vietnamAddressService.getProvinces();
      setProvinces(provincesData);
    } catch (error) {
      setError('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  const handleProvinceChange = async (provinceCode) => {
    setDistricts([]);
    setWards([]);
    form.setFieldsValue({ district: undefined, ward: undefined });
    
    try {
      const districtsData = await vietnamAddressService.getDistricts(provinceCode);
      setDistricts(districtsData);
    } catch (error) {
      setError('Không thể tải danh sách quận/huyện');
    }
  };

  const handleDistrictChange = async (districtCode) => {
    setWards([]);
    form.setFieldsValue({ ward: undefined });
    
    try {
      const wardsData = await vietnamAddressService.getWards(districtCode);
      setWards(wardsData);
    } catch (error) {
      setError('Không thể tải danh sách phường/xã');
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);

    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị GPS');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        setError('Không thể lấy vị trí hiện tại');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      // Lấy thông tin địa chỉ chi tiết
      const addressDetails = await vietnamAddressService.getAddressDetails(
        values.province, 
        values.district, 
        values.ward
      );

      // Xác thực vị trí nếu có GPS
      let locationVerified = false;
      let verificationDistance = null;
      
      if (currentLocation) {
        const selectedProvinceName = provinces.find(p => String(p.code) === String(values.province))?.name;
        if (selectedProvinceName) {
          const result = verifyLocation(selectedProvinceName, currentLocation.lat, currentLocation.lng);
          locationVerified = result.isValid;
          verificationDistance = result.distance;
        }
      }

      const profileData = {
        displayName: values.displayName,
        email: values.email,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        gender: values.gender,
        address: values.address,
        province: addressDetails.province,
        district: addressDetails.district,
        ward: addressDetails.ward,
        fullAddress: addressDetails.fullAddress,
        coordinates: currentLocation,
        locationVerified,
        verificationDistance,
        profileCompleted: true
      };

      onComplete(profileData);
      
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={4} className="mb-2">Hoàn thiện hồ sơ</Title>
          <Text type="secondary">Bổ sung thông tin để hoàn thành nhiệm vụ đầu tiên</Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      destroyOnHidden={true}
    >
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
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="displayName"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
                disabled={loading}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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
                placeholder="Nhập email"
                disabled={loading}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
              rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
            >
              <DatePicker
                placeholder="Chọn ngày sinh"
                style={{ width: '100%' }}
                disabled={loading}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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
        </Row>

        <Form.Item
          name="address"
          label="Địa chỉ chi tiết"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
        >
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="Số nhà, tên đường..."
            disabled={loading}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh!' }]}
            >
              <Select
                placeholder="Chọn tỉnh"
                onChange={handleProvinceChange}
                disabled={loading}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {provinces.map(province => (
                  <Option key={province.code} value={province.code}>
                    {province.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                onChange={handleDistrictChange}
                disabled={loading || districts.length === 0}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {districts.map(district => (
                  <Option key={district.code} value={district.code}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="ward"
              label="Phường/Xã"
              rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                disabled={loading || wards.length === 0}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {wards.map(ward => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div className="mb-4">
          <Button
            onClick={getCurrentLocation}
            loading={gettingLocation}
            className="mb-2"
          >
            📍 Lấy vị trí hiện tại (tùy chọn)
          </Button>
          {currentLocation && (
            <Text type="success" className="block text-sm">
              ✅ Đã lấy vị trí GPS: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </Text>
          )}
        </div>

        <Form.Item>
          <div className="flex justify-between">
            <Button onClick={onClose} disabled={loading}>
              Bỏ qua
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50] hover:border-[#45a049]"
            >
              {loading ? 'Đang lưu...' : 'Hoàn thành'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProfileCompletionModal;