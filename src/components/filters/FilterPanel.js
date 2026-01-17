import React, { useState } from 'react';
import { 
  Typography, 
  Select, 
  Tag, 
  Button, 
  Space,
  Card,
  Slider,
  InputNumber,
  Row,
  Col
} from 'antd';
import { ClearOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

const FilterPanel = ({ onFiltersChange, horizontal = false }) => {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000000],
    location: ''
  });

  const categories = [
    'flowers', // Hoa cắt cành
    'fruits', // Trái cây
    'meat_seafood', // Thịt & Hải sản
    'vegetables' // Rau củ & Nấm
  ];

  const categoryLabels = {
    'flowers': 'Hoa cắt cành',
    'fruits': 'Trái cây', 
    'meat_seafood': 'Thịt & Hải sản',
    'vegetables': 'Rau củ & Nấm'
  };

  const locations = [
    'Hà Nội',
    'TP.HCM',
    'Đà Nẵng',
    'Đà Lạt',
    'Cần Thơ',
    'Hải Phòng',
    'Nha Trang',
    'Vũng Tàu'
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      priceRange: [0, 10000000],
      location: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: horizontal ? 16 : 0
      }}>
        <Text strong style={{ fontSize: 16 }}>
          🔍 Bộ lọc sản phẩm
        </Text>
        <Button 
          type="text" 
          size="small" 
          icon={<ClearOutlined />}
          onClick={clearAllFilters}
        >
          Xóa tất cả
        </Button>
      </div>

      {horizontal ? (
        // Horizontal Layout
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text style={{ fontSize: 12, color: '#666' }}>Danh mục</Text>
              <Select
                placeholder="Chọn danh mục"
                style={{ width: '100%' }}
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                allowClear
                size="small"
              >
                {categories.map(cat => (
                  <Option key={cat} value={cat}>{categoryLabels[cat]}</Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text style={{ fontSize: 12, color: '#666' }}>Khoảng giá</Text>
              <Slider
                range
                min={0}
                max={10000000}
                step={100000}
                value={filters.priceRange}
                onChange={(value) => handleFilterChange('priceRange', value)}
                tooltip={{
                  formatter: (value) => formatPrice(value)
                }}
              />
            </Space>
          </Col>

          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text style={{ fontSize: 12, color: '#666' }}>Địa điểm</Text>
              <Select
                placeholder="Chọn địa điểm"
                style={{ width: '100%' }}
                value={filters.location}
                onChange={(value) => handleFilterChange('location', value)}
                allowClear
                size="small"
              >
                {locations.map(location => (
                  <Option key={location} value={location}>{location}</Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={24} md={6}>
            {/* Hiển thị bộ lọc đã chọn */}
            {(filters.category || filters.location) && (
              <Space wrap size={[4, 4]}>
                {filters.category && (
                  <Tag 
                    closable 
                    onClose={() => handleFilterChange('category', '')}
                    color="green"
                    style={{ fontSize: 10 }}
                  >
                    {categoryLabels[filters.category] || filters.category}
                  </Tag>
                )}
                {filters.location && (
                  <Tag 
                    closable 
                    onClose={() => handleFilterChange('location', '')}
                    color="blue"
                    style={{ fontSize: 10 }}
                  >
                    {filters.location}
                  </Tag>
                )}
              </Space>
            )}
          </Col>
        </Row>
      ) : (
        // Vertical Layout (Original)
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {/* Danh mục */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Danh mục
            </Text>
            <Select
              placeholder="Chọn danh mục"
              style={{ width: '100%' }}
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat} value={cat}>{categoryLabels[cat]}</Option>
              ))}
            </Select>
          </div>

          {/* Khoảng giá */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Khoảng giá (VNĐ)
            </Text>
            <Slider
              range
              min={0}
              max={10000000}
              step={100000}
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
              tooltip={{
                formatter: (value) => formatPrice(value)
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <InputNumber
                size="small"
                value={filters.priceRange[0]}
                onChange={(value) => handleFilterChange('priceRange', [value, filters.priceRange[1]])}
                formatter={value => formatPrice(value)}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '45%' }}
              />
              <InputNumber
                size="small"
                value={filters.priceRange[1]}
                onChange={(value) => handleFilterChange('priceRange', [filters.priceRange[0], value])}
                formatter={value => formatPrice(value)}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '45%' }}
              />
            </div>
          </div>

          {/* Địa điểm */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Địa điểm
            </Text>
            <Select
              placeholder="Chọn địa điểm"
              style={{ width: '100%' }}
              value={filters.location}
              onChange={(value) => handleFilterChange('location', value)}
              allowClear
            >
              {locations.map(location => (
                <Option key={location} value={location}>{location}</Option>
              ))}
            </Select>
          </div>

          {/* Hiển thị bộ lọc đã chọn */}
          {(filters.category || filters.location) && (
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Đã chọn:
              </Text>
              <Space wrap>
                {filters.category && (
                  <Tag closable onClose={() => handleFilterChange('category', '')}>
                    {categoryLabels[filters.category] || filters.category}
                  </Tag>
                )}
                {filters.location && (
                  <Tag closable onClose={() => handleFilterChange('location', '')}>
                    {filters.location}
                  </Tag>
                )}
              </Space>
            </div>
          )}
        </Space>
      )}
    </div>
  );
};

export default FilterPanel;