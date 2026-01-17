import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { nongLacColors } from '../../theme/nongLacTheme';

const { Title, Text } = Typography;

export const NongLacCard = ({ 
  title, 
  subtitle, 
  content, 
  category,
  actions,
  extra,
  className = '',
  hoverable = true,
  loading = false,
  ...props 
}) => {
  const getCategoryColor = (category) => {
    const colorMap = {
      'vegetables': nongLacColors.vegetables,
      'fruits': nongLacColors.fruits,
      'grains': nongLacColors.grains,
      'livestock': nongLacColors.livestock,
      'aquaculture': nongLacColors.aquaculture,
    };
    return colorMap[category] || nongLacColors.primary[500];
  };

  const getCategoryLabel = (category) => {
    const labelMap = {
      'vegetables': 'Rau củ',
      'fruits': 'Trái cây',
      'grains': 'Ngũ cốc',
      'livestock': 'Chăn nuôi',
      'aquaculture': 'Thủy sản',
    };
    return labelMap[category] || category;
  };

  return (
    <Card
      className={`nonglac-card ${className}`}
      title={
        title && (
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              {title}
            </Title>
            {subtitle && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {subtitle}
              </Text>
            )}
          </Space>
        )
      }
      extra={
        <Space>
          {category && (
            <Tag 
              color={getCategoryColor(category)}
              style={{ 
                borderRadius: 16,
                fontSize: 11,
                fontWeight: 500,
                border: 'none',
                color: 'white'
              }}
            >
              {getCategoryLabel(category)}
            </Tag>
          )}
          {extra}
        </Space>
      }
      actions={actions}
      hoverable={hoverable}
      loading={loading}
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(82, 196, 26, 0.08)',
        border: '1px solid #F0F0F0',
        transition: 'all 0.3s ease',
        ...props.style
      }}
      {...props}
    >
      {content}
    </Card>
  );
};

export default NongLacCard;