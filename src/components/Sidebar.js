import React, { useState, useEffect } from 'react';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Chip, Box } from '@mui/material';
import { TrendingUp, LocalFlorist, Pets, Water, Engineering, Store, Help } from '@mui/icons-material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const Sidebar = ({ selectedCategory, onCategoryChange }) => {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [trendingTopics, setTrendingTopics] = useState([]);

  const categories = [
    { name: 'Tất cả', icon: <TrendingUp /> },
    { name: 'Trồng trọt', icon: <LocalFlorist /> },
    { name: 'Chăn nuôi', icon: <Pets /> },
    { name: 'Thủy sản', icon: <Water /> },
    { name: 'Công nghệ nông nghiệp', icon: <Engineering /> },
    { name: 'Thị trường', icon: <Store /> },
    { name: 'Khác', icon: <Help /> }
  ];

  useEffect(() => {
    loadCategoryCounts();
    loadTrendingTopics();
  }, []);

  const loadCategoryCounts = async () => {
    try {
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const counts = {};
      
      postsSnapshot.docs.forEach(doc => {
        const category = doc.data().category || 'Khác';
        counts[category] = (counts[category] || 0) + 1;
      });
      
      counts['Tất cả'] = postsSnapshot.size;
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error loading category counts:', error);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const postsSnapshot = await getDocs(
        query(collection(db, 'posts'))
      );
      
      // Extract unique topics from recent posts
      const topics = postsSnapshot.docs
        .slice(0, 5)
        .map(doc => doc.data().title || doc.data().content?.substring(0, 30))
        .filter(Boolean);
      
      setTrendingTopics(topics);
    } catch (error) {
      console.error('Error loading trending topics:', error);
    }
  };

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
              <Chip label={categoryCounts[cat.name] || 0} size="small" variant="outlined" />
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