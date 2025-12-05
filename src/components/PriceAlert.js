import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Chip } from '@mui/material';
import { NotificationsActive } from '@mui/icons-material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

const PriceAlert = () => {
  const { user } = useAuth();
  const [product, setProduct] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState('above');

  const handleCreateAlert = async () => {
    if (!user || !product || !targetPrice) return;

    try {
      await addDoc(collection(db, 'priceAlerts'), {
        userId: user.uid,
        productName: product,
        targetPrice: parseFloat(targetPrice),
        alertType,
        isActive: true,
        createdAt: new Date()
      });

      setProduct('');
      setTargetPrice('');
      alert('Cảnh báo giá đã được tạo!');
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <NotificationsActive color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Cảnh báo giá</Typography>
        </Box>
        
        <TextField
          fullWidth
          label="Tên sản phẩm"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Giá mục tiêu (VND)"
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Loại cảnh báo</InputLabel>
          <Select value={alertType} onChange={(e) => setAlertType(e.target.value)}>
            <MenuItem value="above">Khi giá trên</MenuItem>
            <MenuItem value="below">Khi giá dưới</MenuItem>
          </Select>
        </FormControl>
        
        <Button variant="contained" fullWidth onClick={handleCreateAlert}>
          Tạo cảnh báo
        </Button>
      </CardContent>
    </Card>
  );
};

export default PriceAlert;