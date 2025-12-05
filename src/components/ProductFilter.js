import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Space, Typography, message } from 'antd';
import { EnvironmentOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const ProductFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    productType: '',
    location: '',
    nearMe: false
  });
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const productTypes = [
    'Lúa gạo', 'Ngô', 'Khoai lang', 'Khoai tây', 'Sắn',
    'Cà phê', 'Cao su', 'Tiêu', 'Điều', 'Dừa',
    'Xoài', 'Chuối', 'Cam', 'Bưởi', 'Nhãn',
    'Rau xanh', 'Rau củ', 'Gia vị', 'Hoa màu',
    'Tôm', 'Cá', 'Thủy sản khác'
  ];

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

  // Mapping coordinates for major provinces (simplified)
  const provinceCoords = {
    'TP. Hồ Chí Minh': { lat: 10.8231, lng: 106.6297 },
    'Hà Nội': { lat: 21.0285, lng: 105.8542 },
    'Đà Nẵng': { lat: 16.0544, lng: 108.2022 },
    'Cần Thơ': { lat: 10.0452, lng: 105.7469 },
    'An Giang': { lat: 10.3840, lng: 105.4352 },
    'Đồng Tháp': { lat: 10.4938, lng: 105.6881 },
    'Long An': { lat: 10.6956, lng: 106.2431 },
    'Đắk Lắk': { lat: 12.6667, lng: 108.0000 },
    'Lâm Đồng': { lat: 11.5753, lng: 108.1429 }
  };

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        message.error('Trình duyệt không hỗ trợ định vị!');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Find nearest province
          const nearestProvince = findNearestProvince(latitude, longitude);
          const newFilters = { 
            ...filters, 
            location: nearestProvince,
            nearMe: true 
          };
          setFilters(newFilters);
          onFilterChange(newFilters);
          
          message.success(`Đã tìm thấy vị trí: ${nearestProvince}`);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          message.error('Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí!');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } catch (error) {
      console.error('Location request error:', error);
      message.error('Lỗi khi yêu cầu vị trí!');
      setLocationLoading(false);
    }
  };

  const findNearestProvince = (lat, lng) => {
    let minDistance = Infinity;
    let nearestProvince = '';

    Object.entries(provinceCoords).forEach(([province, coords]) => {
      const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestProvince = province;
      }
    });

    return nearestProvince || 'TP. Hồ Chí Minh';
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'location' && value !== filters.location) {
      newFilters.nearMe = false;
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { productType: '', location: '', nearMe: false };
    setFilters(clearedFilters);
    setUserLocation(null);
    onFilterChange(clearedFilters);
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap style={{ width: '100%' }}>
        <div>
          <Text strong style={{ marginRight: 8 }}>
            <FilterOutlined /> Bộ lọc:
          </Text>
        </div>
        
        <Select
          placeholder="Loại nông sản"
          style={{ minWidth: 150 }}
          value={filters.productType || undefined}
          onChange={(value) => handleFilterChange('productType', value)}
          allowClear
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {productTypes.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>

        <Select
          placeholder="Địa điểm"
          style={{ minWidth: 150 }}
          value={filters.location || undefined}
          onChange={(value) => handleFilterChange('location', value)}
          allowClear
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {provinces.map(province => (
            <Option key={province} value={province}>{province}</Option>
          ))}
        </Select>

        <Button
          icon={<EnvironmentOutlined />}
          onClick={requestLocation}
          loading={locationLoading}
          type={filters.nearMe ? 'primary' : 'default'}
        >
          {filters.nearMe ? 'Gần tôi' : 'Tìm gần tôi'}
        </Button>

        <Button
          icon={<ClearOutlined />}
          onClick={clearFilters}
          disabled={!filters.productType && !filters.location && !filters.nearMe}
        >
          Xóa bộ lọc
        </Button>
      </Space>
    </Card>
  );
};

export default ProductFilter;