import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { TrendingUp, Agriculture, Restaurant, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DropdownMenu = ({ title, icon, items, isMobile = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item) => {
    // Tạm thời chỉ hiển thị, chưa navigate
    console.log('Selected:', item.text);
    handleClose();
  };

  if (isMobile) {
    return items.map((item) => (
      <MenuItem key={item.path} onClick={() => handleItemClick(item)}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text} />
      </MenuItem>
    ));
  }

  return (
    <>
      <Button
        color="inherit"
        startIcon={icon}
        endIcon={<ExpandMore />}
        onClick={handleClick}
        sx={{ textTransform: 'none' }}
      >
        {title}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {items.map((item) => (
          <MenuItem key={item.path} onClick={() => handleItemClick(item)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DropdownMenu;