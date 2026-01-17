# 🎨 KẾ HOẠCH TỐI ƯU HÓA ANT DESIGN CHO NÔNG LẠC

## 1. THEME CUSTOMIZATION - PHONG CÁCH NÔNG NGHIỆP

### 1.1 Enhanced Theme Configuration
```javascript
// src/theme/antdTheme.js
export const nongLacTheme = {
  token: {
    // Brand Colors - Nông nghiệp
    colorPrimary: '#52C41A',        // Xanh lá chính (nông nghiệp)
    colorSuccess: '#73D13D',        // Xanh lá nhạt (thành công)
    colorWarning: '#FAAD14',        // Vàng (cảnh báo giá)
    colorError: '#FF4D4F',          // Đỏ (lỗi)
    colorInfo: '#1890FF',           // Xanh dương (thông tin)
    
    // Background Colors
    colorBgLayout: '#F6FFED',       // Nền xanh nhạt
    colorBgContainer: '#FFFFFF',    // Nền container
    colorBgElevated: '#FFFFFF',     // Nền nổi
    
    // Text Colors
    colorText: '#262626',           // Text chính
    colorTextSecondary: '#595959',  // Text phụ
    colorTextTertiary: '#8C8C8C',   // Text mờ
    
    // Border & Radius
    borderRadius: 8,                // Bo góc nhẹ
    borderRadiusLG: 12,            // Bo góc lớn
    borderRadiusSM: 6,             // Bo góc nhỏ
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // Typography
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    
    // Shadows - Nhẹ nhàng, tự nhiên
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  
  components: {
    // Button customization
    Button: {
      colorPrimary: '#52C41A',
      algorithm: true,
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 24,
    },
    
    // Card customization - Phong cách nông nghiệp
    Card: {
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(82, 196, 26, 0.08)',
      headerBg: '#F6FFED',
      colorBorderSecondary: '#D9F7BE',
    },
    
    // Form customization
    Form: {
      itemMarginBottom: 20,
      labelColor: '#262626',
      labelFontWeight: 500,
    },
    
    // Input customization
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 16,
      colorBorder: '#D9D9D9',
      colorBorderHover: '#52C41A',
      colorPrimaryHover: '#73D13D',
    },
    
    // Table customization
    Table: {
      borderRadius: 8,
      colorBorderSecondary: '#F0F0F0',
      headerBg: '#FAFAFA',
      headerColor: '#262626',
      headerSortActiveBg: '#F6FFED',
    },
    
    // Tag customization - Màu nông nghiệp
    Tag: {
      borderRadius: 16,
      fontSizeSM: 12,
      lineHeightSM: 1.5,
    },
    
    // Modal customization
    Modal: {
      borderRadius: 12,
      headerBg: '#FFFFFF',
      contentBg: '#FFFFFF',
    },
    
    // Menu customization
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#F6FFED',
      itemSelectedColor: '#52C41A',
      itemHoverBg: '#F6FFED',
      itemHoverColor: '#52C41A',
    },
  },
  
  // Algorithm để tự động tạo màu
  algorithm: theme.defaultAlgorithm,
};
```

### 1.2 Semantic Color System
```javascript
// src/theme/colors.js
export const nongLacColors = {
  // Primary Palette - Xanh nông nghiệp
  primary: {
    50: '#F6FFED',
    100: '#D9F7BE', 
    200: '#B7EB8F',
    300: '#95DE64',
    400: '#73D13D',
    500: '#52C41A',  // Main brand color
    600: '#389E0D',
    700: '#237804',
    800: '#135200',
    900: '#092B00',
  },
  
  // Functional Colors
  success: '#73D13D',    // Thành công
  warning: '#FAAD14',    // Cảnh báo giá
  error: '#FF4D4F',      // Lỗi
  info: '#1890FF',       // Thông tin
  
  // Agricultural Context Colors
  harvest: '#FAAD14',    // Màu vàng lúa
  soil: '#8B4513',       // Màu đất
  water: '#1890FF',      // Màu nước
  sun: '#FFA940',        // Màu nắng
  
  // Price Trend Colors
  priceUp: '#52C41A',    // Giá tăng
  priceDown: '#FF4D4F',  // Giá giảm
  priceStable: '#8C8C8C', // Giá ổn định
  
  // Category Colors
  vegetables: '#52C41A',  // Rau củ
  fruits: '#FA8C16',     // Trái cây
  grains: '#FAAD14',     // Ngũ cốc
  livestock: '#722ED1',  // Chăn nuôi
  aquaculture: '#13C2C2', // Thủy sản
};
```

## 2. COMPONENT SYSTEM OPTIMIZATION

### 2.1 Standardized Component Library
```javascript
// src/components/common/NongLacCard.jsx
import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { nongLacColors } from '../../theme/colors';

const { Title, Text } = Typography;

export const NongLacCard = ({ 
  title, 
  subtitle, 
  content, 
  category,
  actions,
  extra,
  className = '',
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

  return (
    <Card
      className={`nonglac-card ${className}`}
      title={
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
                border: 'none'
              }}
            >
              {category}
            </Tag>
          )}
          {extra}
        </Space>
      }
      actions={actions}
      hoverable
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(82, 196, 26, 0.08)',
        border: '1px solid #F0F0F0',
        transition: 'all 0.3s ease',
      }}
      {...props}
    >
      {content}
    </Card>
  );
};

// src/components/common/PriceDisplay.jsx
import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { RiseOutlined, FallOutlined, MinusOutlined } from '@ant-design/icons';
import { nongLacColors } from '../../theme/colors';

const { Text, Title } = Typography;

export const PriceDisplay = ({ 
  currentPrice, 
  previousPrice, 
  unit = 'VNĐ/kg',
  size = 'default' // 'small' | 'default' | 'large'
}) => {
  const change = currentPrice - previousPrice;
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
  
  const titleLevel = size === 'large' ? 2 : size === 'small' ? 5 : 3;
  
  return (
    <Space direction="vertical" size={2}>
      <Title 
        level={titleLevel} 
        style={{ 
          margin: 0, 
          color: '#262626',
          fontWeight: 600 
        }}
      >
        {formatPrice(currentPrice)} {unit}
      </Title>
      
      {previousPrice && (
        <Space size={8}>
          <Tag
            icon={getTrendIcon()}
            color={getTrendColor()}
            style={{
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 500,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {Math.abs(changePercent)}%
          </Tag>
          
          <Text 
            type="secondary" 
            style={{ 
              fontSize: 12,
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

// src/components/common/CategoryTag.jsx
import React from 'react';
import { Tag } from 'antd';
import { 
  LeafOutlined, 
  AppleOutlined, 
  WheatOutlined,
  CrownOutlined,
  FishOutlined 
} from '@ant-design/icons';
import { nongLacColors } from '../../theme/colors';

export const CategoryTag = ({ category, size = 'default' }) => {
  const categoryConfig = {
    vegetables: {
      icon: <LeafOutlined />,
      color: nongLacColors.vegetables,
      label: 'Rau củ'
    },
    fruits: {
      icon: <AppleOutlined />,
      color: nongLacColors.fruits,
      label: 'Trái cây'
    },
    grains: {
      icon: <WheatOutlined />,
      color: nongLacColors.grains,
      label: 'Ngũ cốc'
    },
    livestock: {
      icon: <CrownOutlined />,
      color: nongLacColors.livestock,
      label: 'Chăn nuôi'
    },
    aquaculture: {
      icon: <FishOutlined />,
      color: nongLacColors.aquaculture,
      label: 'Thủy sản'
    }
  };
  
  const config = categoryConfig[category] || categoryConfig.vegetables;
  
  return (
    <Tag
      icon={config.icon}
      color={config.color}
      style={{
        borderRadius: size === 'small' ? 12 : 16,
        fontSize: size === 'small' ? 10 : 12,
        fontWeight: 500,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: size === 'small' ? '2px 8px' : '4px 12px'
      }}
    >
      {config.label}
    </Tag>
  );
};
```

### 2.2 Layout Components
```javascript
// src/components/layout/NongLacLayout.jsx
import React from 'react';
import { Layout, BackTop, FloatButton } from 'antd';
import { MessageOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ResponsiveNavbar from '../ResponsiveNavbar';

const { Content, Footer } = Layout;

export const NongLacLayout = ({ children, showChatBot = true }) => {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F6FFED' }}>
      <ResponsiveNavbar />
      
      <Content style={{ 
        padding: '24px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%'
      }}>
        {children}
      </Content>
      
      <Footer style={{ 
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #F0F0F0'
      }}>
        NôngLạc ©2026 - Mạng xã hội nông nghiệp hàng đầu Việt Nam
      </Footer>
      
      {/* Floating Action Buttons */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24 }}
        icon={<QuestionCircleOutlined />}
      >
        {showChatBot && (
          <FloatButton
            icon={<MessageOutlined />}
            tooltip="Chat với AI"
            onClick={() => {
              // Open chat bot
            }}
          />
        )}
        <FloatButton
          icon={<QuestionCircleOutlined />}
          tooltip="Trợ giúp"
        />
      </FloatButton.Group>
      
      <BackTop />
    </Layout>
  );
};

// src/components/layout/PageHeader.jsx
import React from 'react';
import { PageHeader as AntPageHeader, Breadcrumb, Space, Tag } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

export const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  tags = [],
  extra,
  onBack 
}) => {
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF',
      padding: '24px',
      borderRadius: 12,
      marginBottom: 24,
      border: '1px solid #F0F0F0'
    }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          {breadcrumbs.map((item, index) => (
            <Breadcrumb.Item key={index} href={item.href}>
              {item.title}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      
      <AntPageHeader
        title={title}
        subTitle={subtitle}
        onBack={onBack}
        extra={extra}
        tags={tags.map((tag, index) => (
          <Tag key={index} color={tag.color}>
            {tag.label}
          </Tag>
        ))}
        style={{ padding: 0 }}
      />
    </div>
  );
};
```

## 3. FORM SYSTEM ENHANCEMENT

### 3.1 Smart Form Components
```javascript
// src/components/forms/NongLacForm.jsx
import React from 'react';
import { Form, Button, Space, Card, Typography } from 'antd';

const { Title } = Typography;

export const NongLacForm = ({ 
  title,
  subtitle,
  onFinish,
  onFinishFailed,
  loading = false,
  submitText = 'Gửi',
  resetText = 'Đặt lại',
  showReset = true,
  children,
  ...formProps
}) => {
  const [form] = Form.useForm();
  
  const handleReset = () => {
    form.resetFields();
  };
  
  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(82, 196, 26, 0.08)',
      }}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: 24 }}>
          {title && (
            <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
              {title}
            </Title>
          )}
          {subtitle && (
            <Typography.Text type="secondary">
              {subtitle}
            </Typography.Text>
          )}
        </div>
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        requiredMark={false}
        {...formProps}
      >
        {children}
        
        <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                borderRadius: 8,
                paddingInline: 32,
                height: 44,
                fontWeight: 500
              }}
            >
              {submitText}
            </Button>
            
            {showReset && (
              <Button
                onClick={handleReset}
                size="large"
                style={{
                  borderRadius: 8,
                  paddingInline: 24,
                  height: 44
                }}
              >
                {resetText}
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

// src/components/forms/ProductForm.jsx - Enhanced version
import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Upload, Row, Col, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { NongLacForm } from './NongLacForm';
import { CategoryTag } from '../common/CategoryTag';

const { TextArea } = Input;
const { Option } = Select;

export const ProductForm = ({ onSubmit, initialValues, loading }) => {
  const [imageList, setImageList] = useState([]);
  
  const categories = [
    { value: 'vegetables', label: 'Rau củ' },
    { value: 'fruits', label: 'Trái cây' },
    { value: 'grains', label: 'Ngũ cốc' },
    { value: 'livestock', label: 'Chăn nuôi' },
    { value: 'aquaculture', label: 'Thủy sản' }
  ];
  
  const handleImageChange = ({ fileList }) => {
    setImageList(fileList);
  };
  
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );
  
  return (
    <NongLacForm
      title="Đăng sản phẩm"
      subtitle="Chia sẻ sản phẩm nông nghiệp của bạn với cộng đồng"
      onFinish={onSubmit}
      loading={loading}
      submitText="Đăng sản phẩm"
      initialValues={initialValues}
    >
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[
              { required: true, message: 'Vui lòng nhập tên sản phẩm' },
              { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input 
              placeholder="VD: Cà chua cherry hữu cơ"
              size="large"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select 
              placeholder="Chọn danh mục sản phẩm"
              size="large"
            >
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>
                  <CategoryTag category={cat.value} size="small" />
                  <span style={{ marginLeft: 8 }}>{cat.label}</span>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item
            name="price"
            label="Giá (VNĐ/kg)"
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 1000, message: 'Giá phải lớn hơn 1,000 VNĐ' }
            ]}
          >
            <InputNumber
              placeholder="50,000"
              style={{ width: '100%' }}
              size="large"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={8}>
          <Form.Item
            name="quantity"
            label="Số lượng (kg)"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber
              placeholder="100"
              style={{ width: '100%' }}
              size="large"
              min={1}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={8}>
          <Form.Item
            name="location"
            label="Địa điểm"
            rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
          >
            <Input 
              placeholder="VD: Đà Lạt, Lâm Đồng"
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="description"
        label="Mô tả sản phẩm"
        rules={[
          { required: true, message: 'Vui lòng nhập mô tả' },
          { min: 20, message: 'Mô tả phải có ít nhất 20 ký tự' }
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Mô tả chi tiết về sản phẩm: chất lượng, nguồn gốc, cách bảo quản..."
          showCount
          maxLength={500}
        />
      </Form.Item>
      
      <Form.Item
        name="images"
        label="Hình ảnh sản phẩm"
        rules={[{ required: true, message: 'Vui lòng tải lên ít nhất 1 hình ảnh' }]}
      >
        <Upload
          listType="picture-card"
          fileList={imageList}
          onChange={handleImageChange}
          beforeUpload={() => false} // Prevent auto upload
          multiple
          maxCount={5}
        >
          {imageList.length >= 5 ? null : uploadButton}
        </Upload>
      </Form.Item>
    </NongLacForm>
  );
};
```

## 4. DATA VISUALIZATION COMPONENTS

### 4.1 Price Charts & Analytics
```javascript
// src/components/charts/PriceTrendChart.jsx
import React from 'react';
import { Card, Typography, Space, Tag, Statistic, Row, Col } from 'antd';
import { Line } from '@ant-design/plots';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { nongLacColors } from '../../theme/colors';

const { Title, Text } = Typography;

export const PriceTrendChart = ({ 
  data, 
  title, 
  productName,
  currentPrice,
  previousPrice 
}) => {
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice ? ((change / previousPrice) * 100).toFixed(1) : 0;
  
  const config = {
    data,
    xField: 'date',
    yField: 'price',
    smooth: true,
    color: change >= 0 ? nongLacColors.priceUp : nongLacColors.priceDown,
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: change >= 0 ? nongLacColors.priceUp : nongLacColors.priceDown,
        lineWidth: 2,
      },
    },
    area: {
      style: {
        fill: `l(270) 0:${change >= 0 ? nongLacColors.priceUp : nongLacColors.priceDown}20 1:${change >= 0 ? nongLacColors.priceUp : nongLacColors.priceDown}05`,
      },
    },
    xAxis: {
      type: 'timeCat',
      tickCount: 5,
    },
    yAxis: {
      label: {
        formatter: (v) => `${(v / 1000).toFixed(0)}K`,
      },
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: 'Giá',
          value: `${new Intl.NumberFormat('vi-VN').format(datum.price)} VNĐ/kg`,
        };
      },
    },
  };
  
  return (
    <Card
      title={
        <Space direction="vertical" size={4}>
          <Title level={4} style={{ margin: 0 }}>
            {title || `Biểu đồ giá ${productName}`}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Cập nhật: {new Date().toLocaleDateString('vi-VN')}
          </Text>
        </Space>
      }
      extra={
        <Tag
          icon={change >= 0 ? <RiseOutlined /> : <FallOutlined />}
          color={change >= 0 ? nongLacColors.priceUp : nongLacColors.priceDown}
          style={{ borderRadius: 12, fontWeight: 500 }}
        >
          {change >= 0 ? '+' : ''}{changePercent}%
        </Tag>
      }
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(82, 196, 26, 0.08)',
      }}
    >
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Statistic
            title="Giá hiện tại"
            value={currentPrice}
            suffix="VNĐ/kg"
            formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
            valueStyle={{ 
              color: change >= 0 ? nongLacColors.priceUp : nongLacColors.priceDown,
              fontWeight: 600 
            }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Thay đổi"
            value={Math.abs(change)}
            suffix="VNĐ/kg"
            prefix={change >= 0 ? '+' : '-'}
            formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
            valueStyle={{ 
              color: change >= 0 ? nongLacColors.priceUp : nongLacColors.priceDown,
              fontWeight: 600 
            }}
          />
        </Col>
      </Row>
      
      <Line {...config} height={300} />
    </Card>
  );
};

// src/components/charts/MarketOverview.jsx
import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Typography } from 'antd';
import { Pie } from '@ant-design/plots';
import { nongLacColors } from '../../theme/colors';

const { Title } = Typography;

export const MarketOverview = ({ marketData, categoryData }) => {
  const pieConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    innerRadius: 0.6,
    color: [
      nongLacColors.vegetables,
      nongLacColors.fruits,
      nongLacColors.grains,
      nongLacColors.livestock,
      nongLacColors.aquaculture,
    ],
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{percentage}',
      style: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
        fill: 'white',
      },
    },
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fontSize: 12,
        },
      },
    },
  };
  
  return (
    <Row gutter={24}>
      <Col xs={24} lg={12}>
        <Card
          title="Tổng quan thị trường"
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(82, 196, 26, 0.08)',
            height: '100%'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Tổng sản phẩm"
                value={marketData.totalProducts}
                valueStyle={{ color: nongLacColors.primary[500] }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Người bán"
                value={marketData.totalSellers}
                valueStyle={{ color: nongLacColors.primary[500] }}
              />
            </Col>
          </Row>
          
          <div style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Hoạt động hôm nay</Text>
                <Progress
                  percent={marketData.todayActivity}
                  strokeColor={nongLacColors.primary[500]}
                  trailColor="#F0F0F0"
                />
              </div>
              
              <div>
                <Text>Tăng trưởng tháng</Text>
                <Progress
                  percent={marketData.monthlyGrowth}
                  strokeColor={nongLacColors.success}
                  trailColor="#F0F0F0"
                />
              </div>
            </Space>
          </div>
        </Card>
      </Col>
      
      <Col xs={24} lg={12}>
        <Card
          title="Phân bố danh mục"
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(82, 196, 26, 0.08)',
            height: '100%'
          }}
        >
          <Pie {...pieConfig} height={250} />
        </Card>
      </Col>
    </Row>
  );
};
```

## 5. RESPONSIVE DESIGN SYSTEM

### 5.1 Breakpoint System
```javascript
// src/theme/breakpoints.js
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

// src/hooks/useResponsive.js
import { useState, useEffect } from 'react';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

export const useResponsive = () => {
  const screens = useBreakpoint();
  
  const isMobile = screens.xs && !screens.sm;
  const isTablet = screens.sm && !screens.lg;
  const isDesktop = screens.lg;
  
  return {
    screens,
    isMobile,
    isTablet,
    isDesktop,
    // Utility functions
    getColSpan: (mobile, tablet, desktop) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      return desktop;
    },
    getGridProps: () => ({
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 4,
    }),
  };
};

// src/components/layout/ResponsiveGrid.jsx
import React from 'react';
import { Row, Col } from 'antd';
import { useResponsive } from '../../hooks/useResponsive';

export const ResponsiveGrid = ({ 
  children, 
  gutter = [16, 16],
  itemsPerRow = { xs: 1, sm: 2, md: 3, lg: 4 }
}) => {
  const { screens } = useResponsive();
  
  const getColSpan = () => {
    if (screens.xs && !screens.sm) return 24 / itemsPerRow.xs;
    if (screens.sm && !screens.md) return 24 / itemsPerRow.sm;
    if (screens.md && !screens.lg) return 24 / itemsPerRow.md;
    return 24 / itemsPerRow.lg;
  };
  
  return (
    <Row gutter={gutter}>
      {React.Children.map(children, (child, index) => (
        <Col key={index} span={getColSpan()}>
          {child}
        </Col>
      ))}
    </Row>
  );
};
```

## 6. PERFORMANCE OPTIMIZATION

### 6.1 Component Lazy Loading
```javascript
// src/components/LazyComponents.jsx
import React, { Suspense } from 'react';
import { Spin } from 'antd';

const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 200 
  }}>
    <Spin size="large" />
  </div>
);

// Lazy load heavy components
export const LazyPriceTrendChart = React.lazy(() => 
  import('./charts/PriceTrendChart').then(module => ({ 
    default: module.PriceTrendChart 
  }))
);

export const LazyMarketOverview = React.lazy(() => 
  import('./charts/MarketOverview').then(module => ({ 
    default: module.MarketOverview 
  }))
);

// Wrapper component
export const LazyComponent = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);
```

### 6.2 Optimized Table Components
```javascript
// src/components/tables/OptimizedTable.jsx
import React, { useMemo } from 'react';
import { Table, Space, Tag, Button } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CategoryTag, PriceDisplay } from '../common';

export const ProductTable = ({ 
  data, 
  loading, 
  onView, 
  onEdit, 
  onDelete,
  pagination = true 
}) => {
  const columns = useMemo(() => [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <CategoryTag category={category} size="small" />,
      filters: [
        { text: 'Rau củ', value: 'vegetables' },
        { text: 'Trái cây', value: 'fruits' },
        { text: 'Ngũ cốc', value: 'grains' },
        { text: 'Chăn nuôi', value: 'livestock' },
        { text: 'Thủy sản', value: 'aquaculture' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price, record) => (
        <PriceDisplay
          currentPrice={price}
          previousPrice={record.previousPrice}
          size="small"
        />
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity) => `${quantity} kg`,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          active: { color: 'success', text: 'Đang bán' },
          sold: { color: 'default', text: 'Đã bán' },
          pending: { color: 'processing', text: 'Chờ duyệt' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: 'Đang bán', value: 'active' },
        { text: 'Đã bán', value: 'sold' },
        { text: 'Chờ duyệt', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView?.(record)}
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
            size="small"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete?.(record)}
            size="small"
          />
        </Space>
      ),
    },
  ], [onView, onEdit, onDelete]);
  
  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination ? {
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} của ${total} sản phẩm`,
        pageSizeOptions: ['10', '20', '50', '100'],
      } : false}
      scroll={{ x: 1000 }}
      size="middle"
      rowKey="id"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    />
  );
};
```

## 7. IMPLEMENTATION TIMELINE

### Week 1: Theme & Core Components
- [ ] Setup enhanced theme configuration
- [ ] Create NongLacCard, PriceDisplay, CategoryTag components
- [ ] Implement NongLacLayout and PageHeader
- [ ] Update App.js to use new theme

### Week 2: Form System & Data Visualization  
- [ ] Build NongLacForm and enhanced ProductForm
- [ ] Create PriceTrendChart and MarketOverview components
- [ ] Implement responsive grid system
- [ ] Add lazy loading for heavy components

### Week 3: Table Components & Optimization
- [ ] Build OptimizedTable with advanced features
- [ ] Implement responsive design hooks
- [ ] Performance optimization
- [ ] Testing and bug fixes

### Week 4: Integration & Polish
- [ ] Integrate all components into existing pages
- [ ] Final styling and theme adjustments
- [ ] Documentation and component library
- [ ] Performance testing and optimization

## 8. EXPECTED OUTCOMES

### Performance Improvements
- **Bundle size**: Reduced by maintaining single UI library
- **Loading speed**: Faster with optimized components
- **User experience**: Consistent and professional design

### Design Consistency
- **Unified theme**: Agricultural-focused color palette
- **Component library**: Reusable, standardized components
- **Responsive design**: Optimal experience across devices

### Developer Experience
- **Component reusability**: 80% reduction in duplicate code
- **Maintenance**: Easier updates and modifications
- **Documentation**: Clear component usage guidelines