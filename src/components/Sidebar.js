import React from 'react';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Chip, Box, Divider } from '@mui/material';
import { TrendingUp, LocalFlorist, Pets, Water, Engineering, Store, Help } from '@mui/icons-material';

const Sidebar = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { name: 'Tất cả', icon: <TrendingUp />, count: 245 },
    { name: 'Trồng trọt', icon: <LocalFlorist />, count: 89 },
    { name: 'Chăn nuôi', icon: <Pets />, count: 67 },
    { name: 'Thủy sản', icon: <Water />, count: 34 },
    { name: 'Công nghệ nông nghiệp', icon: <Engineering />, count: 28 },
    { name: 'Thị trường', icon: <Store />, count: 19 },
    { name: 'Khác', icon: <Help />, count: 8 }
  ];

  const trendingTopics = [
    'Kỹ thuật trồng lúa ST25',
    'Giá cà phê tăng mạnh',
    'Chăn nuôi heo sạch',
    'Xuất khẩu tôm 2024',
    'Drone phun thuốc'
  ];

  return (
    <Box sx={{ width: 280 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Danh mục
        </Typography>
        <List dense>
          {categories.map((cat) => (
            <ListItem
              key={cat.name}
              button
              selected={selectedCategory === cat.name}
              onClick={() => onCategoryChange(cat.name)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {cat.icon}
              </ListItemIcon>
              <ListItemText primary={cat.name} />
              <Chip label={cat.count} size="small" variant="outlined" />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chủ đề hot
        </Typography>
        <Box>
          {trendingTopics.map((topic, index) => (
            <Chip
              key={index}
              label={topic}
              variant="outlined"
              size="small"
              sx={{ m: 0.5, cursor: 'pointer' }}
              onClick={() => {}}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Sidebar;