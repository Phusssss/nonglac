import React from 'react';
import { Tag } from 'antd';
import { 
  EnvironmentOutlined, 
  AppleOutlined, 
  GoldOutlined,
  CrownOutlined,
  GlobalOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { nongLacColors } from '../../theme/nongLacTheme';

export const CategoryTag = ({ 
  category, 
  size = 'default', // 'small' | 'default' | 'large'
  showIcon = true,
  showLabel = true,
  style = {}
}) => {
  const categoryConfig = {
    vegetables: {
      icon: <EnvironmentOutlined />,
      color: nongLacColors.vegetables,
      label: 'Rau củ'
    },
    fruits: {
      icon: <AppleOutlined />,
      color: nongLacColors.fruits,
      label: 'Trái cây'
    },
    grains: {
      icon: <GoldOutlined />,
      color: nongLacColors.grains,
      label: 'Ngũ cốc'
    },
    livestock: {
      icon: <CrownOutlined />,
      color: nongLacColors.livestock,
      label: 'Chăn nuôi'
    },
    aquaculture: {
      icon: <GlobalOutlined />,
      color: nongLacColors.aquaculture,
      label: 'Thủy sản'
    },
    // Default fallback
    default: {
      icon: <ShopOutlined />,
      color: nongLacColors.primary[500],
      label: 'Khác'
    }
  };
  
  const config = categoryConfig[category] || categoryConfig.default;
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          borderRadius: 12,
          fontSize: 10,
          padding: '2px 8px',
          height: 20,
          lineHeight: '16px'
        };
      case 'large':
        return {
          borderRadius: 20,
          fontSize: 14,
          padding: '6px 16px',
          height: 32,
          lineHeight: '20px'
        };
      default:
        return {
          borderRadius: 16,
          fontSize: 12,
          padding: '4px 12px',
          height: 24,
          lineHeight: '16px'
        };
    }
  };
  
  const sizeStyles = getSizeStyles();
  
  return (
    <Tag
      icon={showIcon ? config.icon : null}
      color={config.color}
      style={{
        ...sizeStyles,
        fontWeight: 500,
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: showIcon && showLabel ? 4 : 0,
        color: 'white',
        ...style
      }}
    >
      {showLabel ? config.label : null}
    </Tag>
  );
};

export default CategoryTag;