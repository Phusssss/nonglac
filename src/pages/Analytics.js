import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, People, Article, Chat } from '@mui/icons-material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalChats: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load basic stats
      const [postsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'posts')),
        getDocs(collection(db, 'users'))
      ]);

      setStats({
        totalPosts: postsSnapshot.size,
        totalUsers: usersSnapshot.size,
        totalComments: Math.floor(postsSnapshot.size * 2.5), // Mock
        totalChats: Math.floor(usersSnapshot.size * 0.3) // Mock
      });

      // Category distribution
      const categories = {};
      postsSnapshot.docs.forEach(doc => {
        const category = doc.data().category || 'Khác';
        categories[category] = (categories[category] || 0) + 1;
      });

      const categoryChartData = Object.entries(categories).map(([name, value]) => ({
        name,
        value
      }));
      setCategoryData(categoryChartData);

      // Price trends (mock data)
      const mockPriceData = [
        { name: 'T1', 'Cà phê': 115000, 'Gạo': 5500 },
        { name: 'T2', 'Cà phê': 118000, 'Gạo': 5800 },
        { name: 'T3', 'Cà phê': 120000, 'Gạo': 5900 },
        { name: 'T4', 'Cà phê': 118500, 'Gạo': 5750 },
        { name: 'T5', 'Cà phê': 119000, 'Gạo': 5850 },
        { name: 'T6', 'Cà phê': 121000, 'Gạo': 6000 }
      ];
      setPriceData(mockPriceData);

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ color: color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Thống kê hệ thống
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng bài viết"
            value={stats.totalPosts}
            icon={<Article sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Người dùng"
            value={stats.totalUsers}
            icon={<People sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bình luận"
            value={stats.totalComments}
            icon={<Chat sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cuộc trò chuyện"
            value={stats.totalChats}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="error.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố danh mục bài viết
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Xu hướng giá 6 tháng
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()}đ`} />
                  <Bar dataKey="Cà phê" fill="#8884d8" />
                  <Bar dataKey="Gạo" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;