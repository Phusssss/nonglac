import React from 'react';
import { Typography, Space, Tag, Statistic } from 'antd';
import { RiseOutlined, FallOutlined, MinusOutlined } from '@ant-design/icons';
import { nongLacColors } from '../../theme/nongLacTheme';

const { Text } = Typography;

export const PriceDisplay = ({ 
  currentPrice, 
  previousPrice, 
  unit = 'VNĐ/kg',
  size = 'default', // 'small' | 'default' | 'large'
  showChange = true,
  showPercentage = true,
  prefix = '',
  suffix = ''
}) => {
  const change = currentPrice - (previousPrice || 0);
  const changePercent = previousPrice ? ((change / previousPrice) * 100).toFixed(1) : 0;
  
  const getTrendColor = () => {
    if (change > 0) return nongLacColors.priceUp;
    if (change < 0) return nongLacColors.priceDown;
    return nongLacColors.priceStable;
  };
  
  const getTrendIcon = () => {
    if (change > 0) return <RiseOutlined />;
    if (change < 0) return <FallOutlined />;
    return <MinusOutlined />;
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small': return { fontSize: 14 };
      case 'large': return { fontSize: 24 };
      default: return { fontSize: 18 };
    }
  };
  
  const { fontSize } = getFontSize();
  
  if (size === 'small') {
    return (
      <Space direction="vertical" size={2}>
        <Text 
          strong 
          style={{ 
            fontSize: fontSize,
            color: '#262626'
          }}
        >
          {prefix}{formatPrice(currentPrice)} {unit}{suffix}
        </Text>
        
        {showChange && previousPrice && (
          <Space size={4}>
            <Tag
              icon={getTrendIcon()}
              color={getTrendColor()}
              style={{
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 500,
                border: 'none',
                padding: '0 6px',
                height: 18,
                lineHeight: '18px'
              }}
            >
              {showPercentage ? `${Math.abs(changePercent)}%` : formatPrice(Math.abs(change))}
            </Tag>
          </Space>
        )}
      </Space>
    );
  }
  
  return (
    <Space direction="vertical" size={size === 'large' ? 8 : 4}>
      <Statistic
        value={currentPrice}
        prefix={prefix}
        suffix={`${unit}${suffix}`}
        formatter={(value) => formatPrice(value)}
        valueStyle={{ 
          color: '#262626',
          fontWeight: 600,
          fontSize: fontSize
        }}
      />
      
      {showChange && previousPrice && (
        <Space size={8}>
          <Tag
            icon={getTrendIcon()}
            color={getTrendColor()}
            style={{
              borderRadius: 12,
              fontSize: size === 'large' ? 12 : 11,
              fontWeight: 500,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: size === 'large' ? '4px 12px' : '2px 8px'
            }}
          >
            {showPercentage ? `${Math.abs(changePercent)}%` : formatPrice(Math.abs(change))}
          </Tag>
          
          <Text 
            type="secondary" 
            style={{ 
              fontSize: size === 'large' ? 14 : 12,
              color: getTrendColor()
            }}
          >
            {change > 0 ? '+' : ''}{formatPrice(change)} {unit}
          </Text>
        </Space>
      )}
    </Space>
  );
};

export default PriceDisplay;