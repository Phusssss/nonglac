import React, { useState } from 'react';
import { Select, Input, Space, Button, Typography, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { MARKETPLACE_CONSTANTS } from '../constants';

const { Text } = Typography;

const FilterPanel = ({ onFiltersChange, horizontal = false }) => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleClear = () => {
    setFilters({});
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  const content = (
    <>
      <Col xs={24} md={horizontal ? 6 : 24}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong size="small">{MARKETPLACE_CONSTANTS.MESSAGES.LABELS.CATEGORY}</Text>
          <Select
            style={{ width: '100%' }}
            placeholder={MARKETPLACE_CONSTANTS.MESSAGES.LABELS.ALL_CATEGORIES}
            onChange={(val) => handleFilterChange('category', val)}
            value={filters.category || undefined}
            allowClear
          >
            {(MARKETPLACE_CONSTANTS.PRODUCT_CATEGORIES || []).map(category => (
              <Select.Option key={category} value={category}>{category}</Select.Option>
            ))}
          </Select>
        </Space>
      </Col>

      <Col xs={24} md={horizontal ? 6 : 24}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong size="small">{MARKETPLACE_CONSTANTS.MESSAGES.LABELS.CONDITION}</Text>
          <Select
            style={{ width: '100%' }}
            placeholder={MARKETPLACE_CONSTANTS.MESSAGES.LABELS.ALL_CONDITIONS}
            onChange={(val) => handleFilterChange('condition', val)}
            value={filters.condition || undefined}
            allowClear
          >
            {(MARKETPLACE_CONSTANTS.PRODUCT_CONDITIONS || []).map(condition => (
              <Select.Option key={condition} value={condition}>{condition}</Select.Option>
            ))}
          </Select>
        </Space>
      </Col>

      <Col xs={24} md={horizontal ? 8 : 24}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong size="small">{MARKETPLACE_CONSTANTS.MESSAGES.LABELS.REGION}</Text>
          <Input
            placeholder="Nhập khu vực..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            value={filters.location || ''}
            allowClear
          />
        </Space>
      </Col>

      {Object.keys(filters).length > 0 && (
        <Col xs={24} md={horizontal ? 4 : 24} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button 
            type="text" 
            danger 
            icon={<ReloadOutlined />} 
            onClick={handleClear}
            style={{ padding: 0, height: 40 }}
          >
            Xóa bộ lọc
          </Button>
        </Col>
      )}
    </>
  );

  return (
    <Row gutter={[16, 16]} align="bottom">
      {content}
    </Row>
  );
};

export default FilterPanel;