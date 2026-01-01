import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Typography, Alert, Row, Col } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import vietnamAddressService from '../../services/vietnamAddressService';
import { findNearestProvince, verifyLocation } from '../../data/vietnamLocations';
import registrationService from '../../services/registrationService';

const { Title, Text } = Typography;
const { Option } = Select;

const LocationStep = ({ onNext, onBack, setLoading, setError, loading, error }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [verificationResult, setVerificationResult] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces khi component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provincesData = await vietnamAddressService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        setError('Không thể tải danh sách tỉnh/thành phố');
      } finally {
        setLoadingProvinces(false);
      }
    };
    
    loadProvinces();
  }, []);

  // Xử lý khi chọn tỉnh
  const handleProvinceChange = async (provinceCode) => {
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    form.setFieldsValue({ district: undefined, ward: undefined });
    
    try {
      const districtsData = await vietnamAddressService.getDistricts(provinceCode);
      setDistricts(districtsData);
    } catch (error) {
      setError('Không thể tải danh sách quận/huyện');
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Xử lý khi chọn huyện
  const handleDistrictChange = async (districtCode) => {
    setLoadingWards(true);
    setWards([]);
    form.setFieldsValue({ ward: undefined });
    
    try {
      const wardsData = await vietnamAddressService.getWards(districtCode);
      setWards(wardsData);
    } catch (error) {
      setError('Không thể tải danh sách phường/xã');
    } finally {
      setLoadingWards(false);
    }
  };

  // Lấy vị trí hiện tại
  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationStatus('loading');

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Trình duyệt không hỗ trợ định vị GPS');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationStatus('success');
        setGettingLocation(false);
      },
      (error) => {
        setLocationStatus('error');
        setGettingLocation(false);
        let errorMessage = 'Không thể lấy vị trí hiện tại';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối quyền truy cập vị trí';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng';
            break;
          case error.TIMEOUT:
            errorMessage = 'Hết thời gian chờ lấy vị trí';
            break;
        }
        
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Xác thực vị trí
  const handleVerifyLocation = () => {
    const values = form.getFieldsValue();
    
    if (!values.province || !values.district || !values.ward) {
      setError('Vui lòng chọn đầy đủ địa chỉ');
      return;
    }

    if (!currentLocation) {
      setError('Vui lòng cho phép truy cập vị trí GPS');
      return;
    }

    // Tìm tỉnh tương ứng để xác thực
    const selectedProvinceName = provinces.find(p => String(p.code) === String(values.province))?.name;
    
    if (!selectedProvinceName) {
      setError('Không tìm thấy thông tin tỉnh');
      return;
    }
    
    const result = verifyLocation(selectedProvinceName, currentLocation.lat, currentLocation.lng);
    setVerificationResult(result);
    
    if (!result.isValid) {
      setError(result.message);
    }
  };

  // Hoàn tất bước
  const onFinish = async (values) => {
    if (!verificationResult || !verificationResult.isValid) {
      setError('Vui lòng xác thực vị trí trước khi tiếp tục');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Lấy thông tin địa chỉ chi tiết
      const addressDetails = await vietnamAddressService.getAddressDetails(
        values.province, 
        values.district, 
        values.ward
      );
      
      // Lưu thông tin địa điểm vào registration service
      const locationData = {
        province: addressDetails.province,
        district: addressDetails.district,
        ward: addressDetails.ward,
        fullAddress: addressDetails.fullAddress,
        coordinates: currentLocation,
        verified: true,
        verificationDistance: verificationResult.distance
      };

      const result = registrationService.saveLocationInfo(locationData);
      
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
      <div className="text-center mb-6">
        <Title level={4}>Xác thực địa điểm</Title>
        <Text className="text-gray-600">
          Chọn địa chỉ chi tiết và xác thực vị trí của bạn
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
        layout="vertical" 
        size="large"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item 
              name="province"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh!' }]}
            >
              <Select
                placeholder="Chọn tỉnh"
                onChange={handleProvinceChange}
                loading={loadingProvinces}
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
          
          <Col xs={24} sm={8}>
            <Form.Item 
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                onChange={handleDistrictChange}
                loading={loadingDistricts}
                disabled={districts.length === 0 && !loadingDistricts}
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
          
          <Col xs={24} sm={8}>
            <Form.Item 
              name="ward"
              label="Phường/Xã"
              rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                loading={loadingWards}
                disabled={wards.length === 0 && !loadingWards}
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

        <Form.Item label="Vị trí GPS">
          <div className="space-y-3">
            <Button
              type="default"
              icon={<EnvironmentOutlined />}
              onClick={getCurrentLocation}
              loading={gettingLocation}
              block
            >
              {gettingLocation ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
            </Button>

            {locationStatus === 'success' && currentLocation && (
              <Alert
                message="Đã lấy vị trí GPS thành công"
                description={`Tọa độ: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}
                type="success"
                showIcon
              />
            )}
          </div>
        </Form.Item>

        {form.getFieldValue('ward') && currentLocation && (
          <Form.Item label="Xác thực vị trí">
            <div className="space-y-3">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleVerifyLocation}
                className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50] hover:border-[#45a049]"
                block
              >
                Xác thực vị trí
              </Button>

              {verificationResult && (
                <Alert
                  message={verificationResult.message}
                  type={verificationResult.isValid ? 'success' : 'warning'}
                  showIcon
                  icon={verificationResult.isValid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                />
              )}
            </div>
          </Form.Item>
        )}

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
              disabled={!verificationResult || !verificationResult.isValid}
            >
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </Button>
          </div>
        </Form.Item>
      </Form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <Text className="text-sm text-blue-600">
          💡 <strong>Lưu ý:</strong> Chúng tôi sử dụng API địa chỉ Việt Nam và GPS để xác thực vị trí nhằm đảm bảo thông tin chính xác cho cộng đồng nông nghiệp địa phương.
        </Text>
      </div>
    </div>
  );
};

export default LocationStep;