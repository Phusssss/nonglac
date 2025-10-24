import React from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const FoodPrices = () => {
  const foodPrices = [
    { name: 'Thịt heo', price: 120000, change: 2.5, unit: 'kg' },
    { name: 'Thịt bò', price: 350000, change: -1.2, unit: 'kg' },
    { name: 'Thịt gà', price: 85000, change: 1.8, unit: 'kg' },
    { name: 'Cá tra', price: 45000, change: 3.2, unit: 'kg' },
    { name: 'Tôm thẻ', price: 180000, change: -2.1, unit: 'kg' },
    { name: 'Rau cải', price: 15000, change: 5.5, unit: 'kg' },
    { name: 'Cà chua', price: 25000, change: -3.8, unit: 'kg' },
    { name: 'Khoai tây', price: 18000, change: 1.5, unit: 'kg' },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Giá thực phẩm hôm nay
      </Typography>
      
      <Grid container spacing={3}>
        {foodPrices.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                    {formatPrice(item.price)}
                  </Typography>
                  <Chip
                    icon={item.change > 0 ? <TrendingUp /> : <TrendingDown />}
                    label={`${item.change > 0 ? '+' : ''}${item.change}%`}
                    color={item.change > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Đơn vị: {item.unit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FoodPrices;