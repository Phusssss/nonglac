import React, { useState } from 'react';
import { Button, Paper, Box, Typography, List, ListItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import { TrendingUp, ExpandMore, Agriculture, Restaurant, Assessment, LocalFlorist, Pets, Water, Nature, Store, TrendingDown, ShowChart, BarChart, Timeline, GrassOutlined, Coffee, LocalDining, Fastfood, Cake, Icecream } from '@mui/icons-material';

const MegaMenu = ({ title, icon }) => {
  const [open, setOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const menuData = {
    'Giá cả': {
      columns: [
        {
          title: 'Nông sản chính',
          items: [
            { text: 'Gạo ST25', icon: <GrassOutlined /> },
            { text: 'Gạo Jasmine', icon: <GrassOutlined /> },
            { text: 'Cà phê Robusta', icon: <Coffee /> },
            { text: 'Cà phê Arabica', icon: <Coffee /> },
            { text: 'Cao su', icon: <Nature /> },
            { text: 'Tiêu đen', icon: <LocalFlorist /> },
            { text: 'Tiêu trắng', icon: <LocalFlorist /> },
          ]
        },
        {
          title: 'Thịt & Trứng',
          items: [
            { text: 'Heo hơi', icon: <Pets /> },
            { text: 'Thịt bò', icon: <Pets /> },
            { text: 'Gà thịt', icon: <Pets /> },
            { text: 'Gà ta', icon: <Pets /> },
            { text: 'Trứng gà', icon: <LocalDining /> },
            { text: 'Trứng vịt', icon: <LocalDining /> },
            { text: 'Thịt dê', icon: <Pets /> },
          ]
        },
        {
          title: 'Thủy sản',
          items: [
            { text: 'Tôm sú', icon: <Water /> },
            { text: 'Tôm thẻ', icon: <Water /> },
            { text: 'Cá tra', icon: <Water /> },
            { text: 'Cá basa', icon: <Water /> },
            { text: 'Cá hồi', icon: <Water /> },
            { text: 'Cua biển', icon: <Water /> },
            { text: 'Mực ống', icon: <Water /> },
          ]
        },
        {
          title: 'Rau củ & Trái cây',
          items: [
            { text: 'Rau cải', icon: <Nature /> },
            { text: 'Cà chua', icon: <Nature /> },
            { text: 'Khoai tây', icon: <Nature /> },
            { text: 'Sầu riêng', icon: <LocalFlorist /> },
            { text: 'Xoài', icon: <LocalFlorist /> },
            { text: 'Chuối', icon: <LocalFlorist /> },
            { text: 'Thanh long', icon: <LocalFlorist /> },
          ]
        },
        {
          title: 'Phân tích thị trường',
          items: [
            { text: 'Báo cáo giá', icon: <Assessment /> },
            { text: 'Xu hướng tăng', icon: <TrendingUp /> },
            { text: 'Xu hướng giảm', icon: <TrendingDown /> },
            { text: 'Biểu đồ giá', icon: <ShowChart /> },
            { text: 'Thống kê', icon: <BarChart /> },
            { text: 'Dự báo', icon: <Timeline /> },
            { text: 'So sánh giá', icon: <Assessment /> },
          ]
        }
      ]
    }
  };

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setOpen(false);
    }, 200);
    setTimeoutId(id);
  };

  const handleItemClick = (item) => {
    console.log('Selected:', item.text);
    setOpen(false);
  };

  const currentMenu = menuData[title];

  return (
    <Box 
      sx={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        color="inherit"
        startIcon={icon}
        endIcon={<ExpandMore />}
        sx={{ 
          textTransform: 'none',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
        }}
      >
        {title}
      </Button>
      
      {open && currentMenu && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            minWidth: 1000,
            maxWidth: 1200,
            zIndex: 1300,
            mt: 0.5,
            boxShadow: 3,
            border: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {currentMenu.columns.map((column, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold" 
                    color="primary"
                    sx={{ mb: 1, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}
                  >
                    {column.title}
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    {column.items.map((item, itemIndex) => (
                      <ListItem 
                        key={itemIndex}
                        button
                        onClick={() => handleItemClick(item)}
                        sx={{ 
                          px: 0,
                          py: 0.5,
                          borderRadius: 1,
                          '&:hover': { 
                            backgroundColor: 'primary.50',
                            color: 'primary.main'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default MegaMenu;