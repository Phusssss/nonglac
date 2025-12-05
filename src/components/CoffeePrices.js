import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { TrendingUp, TrendingDown, Coffee } from '@mui/icons-material';

const CoffeePrices = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoffeePrices();
  }, []);

  const fetchCoffeePrices = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'webgia_prices'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const pricesData = [];
      querySnapshot.forEach((doc) => {
        pricesData.push({ id: doc.id, ...doc.data() });
      });
      
      setPrices(pricesData);
    } catch (err) {
      console.error('Error fetching coffee prices:', err);
      setError('Không thể tải dữ liệu giá cà phê');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getPriceChange = (current, previous) => {
    const change = current - previous;
    return {
      value: change,
      percentage: ((change / previous) * 100).toFixed(2)
    };
  };

  const getPriceChangeIcon = (change) => {
    if (change > 0) return <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />;
    if (change < 0) return <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />;
    return null;
  };

  const getPriceChangeColor = (change) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Coffee sx={{ mr: 1, color: '#8B4513' }} />
          <Typography variant="h6" component="h2">
            Giá Cà Phê Hôm Nay
          </Typography>
        </Box>
        
        {prices.length === 0 ? (
          <Typography color="textSecondary">
            Chưa có dữ liệu giá cà phê
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Thị trường</strong></TableCell>
                  <TableCell align="right"><strong>Giá hiện tại</strong></TableCell>
                  <TableCell align="right"><strong>Thay đổi</strong></TableCell>
                  <TableCell align="center"><strong>Ngày cập nhật</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prices.map((price) => {
                  const change = getPriceChange(price.currentPrice, price.previousPrice);
                  return (
                    <TableRow key={price.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" fontWeight="medium">
                            {price.market}
                          </Typography>
                          {price.market.includes('Trung bình') && (
                            <Chip 
                              label="TB" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatPrice(price.currentPrice)} đ/kg
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          {getPriceChangeIcon(change.value)}
                          <Chip
                            label={`${change.value > 0 ? '+' : ''}${formatPrice(change.value)} đ`}
                            size="small"
                            color={getPriceChangeColor(change.value)}
                            variant="outlined"
                            sx={{ ml: 0.5, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="caption" color="textSecondary">
                          {price.date}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="textSecondary">
            Nguồn: WebGia.com
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Đơn vị: VNĐ/kg
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CoffeePrices;