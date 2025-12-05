import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Card, CardContent } from '@mui/material';
import WeatherWidget from '../components/WeatherWidget';
import PriceAlert from '../components/PriceAlert';
import { priceService } from '../services/priceService';

const Dashboard = () => {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    const data = await priceService.getPrices(null, 5);
    setPrices(data);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bảng điều khiển nông dân
      </Typography>
      
      <Grid container spacing={3}>
        {/* Weather Widget */}
        <Grid item xs={12} md={4}>
          <WeatherWidget defaultLocation="Đồng Tháp" />
        </Grid>
        
        {/* Price Alert */}
        <Grid item xs={12} md={4}>
          <PriceAlert />
        </Grid>
        
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê nhanh
              </Typography>
              <Typography variant="body2">
                Sản phẩm theo dõi: {prices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Prices */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Giá gần đây
              </Typography>
              <Grid container spacing={2}>
                {prices.map((price, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box p={2} border={1} borderColor="grey.300" borderRadius={1}>
                      <Typography variant="subtitle1">{price.productName}</Typography>
                      <Typography variant="h6" color="primary">
                        {new Intl.NumberFormat('vi-VN').format(price.currentPrice)}đ/{price.unit}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {price.change}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;