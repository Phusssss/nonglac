import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Chip, Button, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import { TrendingUp, TrendingDown, Refresh, Search } from '@mui/icons-material';
import { fetchLatestPrices, refreshPrices } from '../services/priceService';
import PriceChart from '../components/PriceChart';
import LoadingSpinner from '../components/LoadingSpinner';
import moment from 'moment';

const MarketData = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'Lúa gạo', 'Cà phê', 'Gia vị', 'Cao su', 'Thủy sản', 'Nông sản khác', 'Khác'];

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    const priceData = await fetchLatestPrices();
    setPrices(priceData);
    setLoading(false);
  };

  const updatePrices = async () => {
    setRefreshing(true);
    try {
      await refreshPrices();
      await loadPrices();
    } catch (error) {
      console.error('Error updating prices:', error);
    }
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
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

  const filteredPrices = prices.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.market || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Dữ liệu thị trường nông sản
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={updatePrices}
          disabled={refreshing}
        >
          {refreshing ? 'Đang cập nhật...' : 'Cập nhật giá'}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm sản phẩm hoặc thị trường..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map(category => (
            <Tab
              key={category}
              label={category === 'all' ? 'Tất cả' : category}
              value={category}
            />
          ))}
        </Tabs>
      </Box>
      
      {loading ? (
        <LoadingSpinner message="Đang tải dữ liệu giá..." />
      ) : (
        <Grid container spacing={3}>
          {filteredPrices.slice(0, 6).map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <PriceChart 
                product={item.productName}
                prices={[item, { currentPrice: item.previousPrice }]}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Bảng giá chi tiết
      </Typography>
      
      <Grid container spacing={3}>
        {filteredPrices.map((item, index) => {
          const priceChange = getPriceChange(item.currentPrice, item.previousPrice);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {item.productName}
                    </Typography>
                    <Chip
                      label={item.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                      {formatPrice(item.currentPrice)}
                    </Typography>
                    {priceChange !== '0.0' && (
                      <Chip
                        icon={priceChange > 0 ? <TrendingUp /> : <TrendingDown />}
                        label={`${priceChange > 0 ? '+' : ''}${priceChange}%`}
                        color={getPriceColor(priceChange)}
                        size="small"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Đơn vị: {item.unit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Thị trường: {item.market}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giá trước: {formatPrice(item.previousPrice)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thay đổi: {item.change}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Ngày: {item.date}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredPrices.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy sản phẩm nào
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default MarketData;