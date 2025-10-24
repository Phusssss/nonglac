import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import moment from 'moment';

const PriceUpdate = () => {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'prices'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pricesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrices(pricesData);
    });

    return unsubscribe;
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPriceChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getPriceColor = (change) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Cập nhật giá nông sản
      </Typography>
      
      <Grid container spacing={3}>
        {prices.map(item => {
          const priceChange = getPriceChange(item.currentPrice, item.previousPrice);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.productName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                      {formatPrice(item.currentPrice)}
                    </Typography>
                    {priceChange !== 0 && (
                      <Chip
                        icon={priceChange > 0 ? <TrendingUp /> : <TrendingDown />}
                        label={`${priceChange > 0 ? '+' : ''}${priceChange}%`}
                        color={getPriceColor(priceChange)}
                        size="small"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Đơn vị: {item.unit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thị trường: {item.market}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cập nhật: {moment(item.updatedAt?.toDate()).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default PriceUpdate;