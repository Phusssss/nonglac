import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const PriceChart = ({ product, prices }) => {
  const latestPrice = prices[0];
  const previousPrice = prices[1];
  
  if (!latestPrice) return null;

  const change = previousPrice ? 
    ((latestPrice.currentPrice - previousPrice.currentPrice) / previousPrice.currentPrice * 100).toFixed(1) : 0;

  const isPositive = change > 0;
  const maxPrice = Math.max(...prices.map(p => p.currentPrice));
  const minPrice = Math.min(...prices.map(p => p.currentPrice));
  const priceRange = maxPrice - minPrice;
  const currentPosition = priceRange > 0 ? ((latestPrice.currentPrice - minPrice) / priceRange) * 100 : 50;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {product}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" color="primary" sx={{ mr: 2 }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(latestPrice.currentPrice)}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', color: isPositive ? 'success.main' : 'error.main' }}>
            {isPositive ? <TrendingUp /> : <TrendingDown />}
            <Typography variant="body1" sx={{ ml: 0.5 }}>
              {isPositive ? '+' : ''}{change}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Biến động giá (7 ngày)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={currentPosition}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: isPositive ? 'success.main' : 'error.main'
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Thấp: {new Intl.NumberFormat('vi-VN').format(minPrice)}đ
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cao: {new Intl.NumberFormat('vi-VN').format(maxPrice)}đ
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PriceChart;