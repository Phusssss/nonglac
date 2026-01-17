import React, { useState } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { 
  TrophyOutlined, 
  EnvironmentOutlined, 
  ShopOutlined,
  DownOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const DropdownMenu = ({ title, icon, items, isMobile = false }) => {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    console.log('Selected:', item.text);
    // Navigate functionality can be added here
    // navigate(item.path);
  };

  const menuItems = items.map((item) => ({
    key: item.path,
    icon: item.icon,
    label: item.text,
    onClick: () => handleItemClick(item),
  }));

  if (isMobile) {
    return menuItems.map((item) => (
      <div key={item.key} className="flex items-center p-2 cursor-pointer hover:bg-gray-100" onClick={item.onClick}>
        <span className="mr-2">{item.icon}</span>
        <span>{item.label}</span>
      </div>
    ));
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomLeft"
    >
      <Button type="text" className="text-inherit">
        <Space>
          {icon}
          {title}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default DropdownMenu;