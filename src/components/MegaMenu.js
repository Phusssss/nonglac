import React, { useState } from 'react';
import { Button, Typography, List, Row, Col, Dropdown } from 'antd';
import { 
  TrendingUpOutlined, 
  DownOutlined, 
  ShopOutlined, 
  CoffeeOutlined,
  LineChartOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const MegaMenu = ({ title, icon }) => {
  const handleItemClick = (item) => {
    console.log('Selected:', item.text);
  };

  const menuData = {
    'Giá cả': {
      columns: [
        {
          title: 'Nông sản chính',
          items: [
            { text: 'Gạo ST25', icon: '🌾' },
            { text: 'Gạo Jasmine', icon: '🌾' },
            { text: 'Cà phê Robusta', icon: '☕' },
            { text: 'Cà phê Arabica', icon: '☕' },
            { text: 'Cao su', icon: '🌿' },
            { text: 'Tiêu đen', icon: '🌸' },
            { text: 'Tiêu trắng', icon: '🌸' },
          ]
        },
        {
          title: 'Thịt & Trứng',
          items: [
            { text: 'Heo hơi', icon: '🐷' },
            { text: 'Thịt bò', icon: '🐄' },
            { text: 'Gà thịt', icon: '🐔' },
            { text: 'Gà ta', icon: '🐔' },
            { text: 'Trứng gà', icon: '🥚' },
            { text: 'Trứng vịt', icon: '🥚' },
            { text: 'Thịt dê', icon: '🐐' },
          ]
        },
        {
          title: 'Thủy sản',
          items: [
            { text: 'Tôm sú', icon: '🦐' },
            { text: 'Tôm thẻ', icon: '🦐' },
            { text: 'Cá tra', icon: '🐟' },
            { text: 'Cá basa', icon: '🐟' },
            { text: 'Cá hồi', icon: '🐟' },
            { text: 'Cua biển', icon: '🦀' },
            { text: 'Mực ống', icon: '🦑' },
          ]
        },
        {
          title: 'Rau củ & Trái cây',
          items: [
            { text: 'Rau cải', icon: '🥬' },
            { text: 'Cà chua', icon: '🍅' },
            { text: 'Khoai tây', icon: '🥔' },
            { text: 'Sầu riêng', icon: '🌸' },
            { text: 'Xoài', icon: '🥭' },
            { text: 'Chuối', icon: '🍌' },
            { text: 'Thanh long', icon: '🐉' },
          ]
        },
        {
          title: 'Phân tích thị trường',
          items: [
            { text: 'Báo cáo giá', icon: <LineChartOutlined /> },
            { text: 'Xu hướng tăng', icon: <RiseOutlined /> },
            { text: 'Xu hướng giảm', icon: <FallOutlined /> },
            { text: 'Biểu đồ giá', icon: <LineChartOutlined /> },
            { text: 'Thống kê', icon: <BarChartOutlined /> },
            { text: 'Dự báo', icon: <TrendingUpOutlined /> },
            { text: 'So sánh giá', icon: <LineChartOutlined /> },
          ]
        }
      ]
    }
  };

  const currentMenu = menuData[title];

  const menuItems = currentMenu ? [
    {
      key: 'menu',
      label: (
        <div style={{ minWidth: 1000, maxWidth: 1200, padding: '24px' }}>
          <Row gutter={[16, 16]}>
            {currentMenu.columns.map((column, index) => (
              <Col span={4.8} key={index}>
                <Text strong style={{ 
                  color: '#1890ff', 
                  marginBottom: '8px', 
                  paddingBottom: '8px',
                  borderBottom: '2px solid #1890ff',
                  display: 'block'
                }}>
                  {column.title}
                </Text>
                <List
                  size="small"
                  dataSource={column.items}
                  renderItem={(item) => (
                    <List.Item
                      style={{ 
                        padding: '4px 0',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f0f2ff';
                        e.target.style.color = '#1890ff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'inherit';
                      }}
                    >
                      <List.Item.Meta
                        avatar={typeof item.icon === 'string' ? item.icon : item.icon}
                        title={<Text style={{ fontSize: '14px' }}>{item.text}</Text>}
                      />
                    </List.Item>
                  )}
                />
              </Col>
            ))}
          </Row>
        </div>
      )
    }
  ] : [];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['hover']}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={icon}
        style={{ 
          color: 'inherit',
          border: 'none',
          boxShadow: 'none'
        }}
      >
        {title} <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default MegaMenu;