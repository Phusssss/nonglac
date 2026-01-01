import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Avatar, List, ListItem, ListItemAvatar, ListItemText, Chip, Divider, Button } from '@mui/material';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const RightSidebar = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [news, setNews] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load top users by reputation
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('reputation', 'desc'),
        limit(4)
      );
      const usersSnapshot = await getDocs(usersQuery);
      setTopUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load news posts (category: 'tin-tuc')
      const newsQuery = query(
        collection(db, 'posts'),
        where('category', '==', 'tin-tuc'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const newsSnapshot = await getDocs(newsQuery);
      setNews(newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load featured farms (users with type: 'farm')
      const farmsQuery = query(
        collection(db, 'users'),
        where('userType', '==', 'farm'),
        orderBy('followersCount', 'desc'),
        limit(3)
      );
      const farmsSnapshot = await getDocs(farmsQuery);
      setFarms(farmsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const postDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - postDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Đang tải...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Chuyên gia hàng đầu */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chuyên gia hàng đầu
        </Typography>
        {topUsers.length > 0 ? (
          <List dense>
            {topUsers.map((user) => (
              <ListItem key={user.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.displayName?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.displayName || 'Người dùng'}
                  secondary={<Chip label={`${user.reputation || 0} uy tín`} size="small" color="primary" />}
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">Chưa có dữ liệu</Typography>
        )}
      </Paper>

      {/* Tin tức nông nghiệp */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NewspaperIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Tin tức nông nghiệp</Typography>
        </Box>
        {news.length > 0 ? (
          <Box>
            {news.map((item, index) => (
              <Box key={item.id}>
                <Box sx={{ py: 1.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                      mb: 0.5
                    }}
                  >
                    {item.title || item.content?.substring(0, 60)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getTimeAgo(item.createdAt)}
                  </Typography>
                </Box>
                {index < news.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">Chưa có tin tức</Typography>
        )}
      </Paper>

      {/* Trang trại nổi bật */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AgricultureIcon sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="h6">Trang trại nổi bật</Typography>
        </Box>
        {farms.length > 0 ? (
          <Box>
            {farms.map((farm, index) => (
              <Box key={farm.id}>
                <Box sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Avatar 
                      src={farm.photoURL} 
                      sx={{ width: 48, height: 48, mr: 1.5 }}
                    >
                      {farm.displayName?.charAt(0) || 'F'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {farm.displayName || 'Trang trại'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {farm.location || 'Việt Nam'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 0.5 }}>
                        {farm.farmType || 'Nông nghiệp'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {farm.followersCount || 0} người theo dõi
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined">Theo dõi</Button>
                  </Box>
                </Box>
                {index < farms.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">Chưa có trang trại</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default RightSidebar;