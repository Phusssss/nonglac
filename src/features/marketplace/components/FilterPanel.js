import React, { useEffect, useMemo, useState } from 'react';
import { Select, Input, Button, Typography, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, AppstoreOutlined } from '@ant-design/icons';
import { MARKETPLACE_CONSTANTS } from '../constants';

const { Text } = Typography;

const FilterPanel = ({ onFiltersChange, horizontal = false }) => {
  const [filters, setFilters] = useState({});
  const [locationInput, setLocationInput] = useState('');

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => value !== undefined && value !== null && value !== '');
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        const next = { ...prev, location: locationInput };
        if (!locationInput) delete next.location;
        if (onFiltersChange) onFiltersChange(next);
        return next;
      });
    }, 220);

    return () => clearTimeout(timer);
  }, [locationInput, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    if (!value) delete next[key];
    setFilters(next);
    if (onFiltersChange) onFiltersChange(next);
  };

  const handleClear = () => {
    setFilters({});
    setLocationInput('');
    if (onFiltersChange) onFiltersChange({});
  };

  return (
    <div className="marketplace-filter-panel">
      <div className="marketplace-filter-title">
        <AppstoreOutlined />
        <span>Bộ lọc sản phẩm</span>
      </div>

      <Row gutter={[12, 12]} align="bottom">
        <Col xs={24} md={horizontal ? 6 : 24}>
          <Text strong className="marketplace-filter-label">
            {MARKETPLACE_CONSTANTS.MESSAGES.LABELS.CATEGORY}
          </Text>
          <Select
            style={{ width: '100%' }}
            placeholder={MARKETPLACE_CONSTANTS.MESSAGES.LABELS.ALL_CATEGORIES}
            onChange={(val) => handleFilterChange('category', val)}
            value={filters.category || undefined}
            allowClear
          >
            {(MARKETPLACE_CONSTANTS.PRODUCT_CATEGORIES || []).map((category) => (
              <Select.Option key={category} value={category}>{category}</Select.Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} md={horizontal ? 6 : 24}>
          <Text strong className="marketplace-filter-label">
            {MARKETPLACE_CONSTANTS.MESSAGES.LABELS.CONDITION}
          </Text>
          <Select
            style={{ width: '100%' }}
            placeholder={MARKETPLACE_CONSTANTS.MESSAGES.LABELS.ALL_CONDITIONS}
            onChange={(val) => handleFilterChange('condition', val)}
            value={filters.condition || undefined}
            allowClear
          >
            {(MARKETPLACE_CONSTANTS.PRODUCT_CONDITIONS || []).map((condition) => (
              <Select.Option key={condition} value={condition}>{condition}</Select.Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} md={horizontal ? 8 : 24}>
          <Text strong className="marketplace-filter-label">
            {MARKETPLACE_CONSTANTS.MESSAGES.LABELS.REGION}
          </Text>
          <Input
            placeholder="Nhập tỉnh / thành phố..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            onChange={(e) => setLocationInput(e.target.value)}
            value={locationInput}
            allowClear
          />
        </Col>

        {hasActiveFilters && (
          <Col xs={24} md={horizontal ? 4 : 24} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleClear}
              className="marketplace-clear-filter-btn"
            >
              Xóa bộ lọc
            </Button>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default FilterPanel;
