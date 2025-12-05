import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, ToggleButton, ToggleButtonGroup, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { priceService } from '../services/priceService';

const AdvancedPriceChart = () => {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedProducts, setSelectedProducts] = useState(['Cà phê Robusta']);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
    loadProducts();
  }, [timeRange, selectedProducts]);

  const loadProducts = async () => {
    try {
      const prices = await priceService.getPrices();
      const uniqueProducts = [...new Set(prices.map(p => p.productName))];
      setProducts(uniqueProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadData = async () => {
    try {
      // Generate mock historical data
      const mockData = generateMockHistoricalData(selectedProducts, timeRange);
      setData(mockData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const generateMockHistoricalData = (products, range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const entry = {
        date: date.toLocaleDateString('vi-VN'),
        timestamp: date.getTime()
      };

      products.forEach(product => {
        const basePrice = getBasePrice(product);
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        entry[product] = Math.round(basePrice * (1 + variation));
      });

      data.push(entry);
    }

    return data;
  };

  const getBasePrice = (product) => {
    const basePrices = {
      'Cà phê Robusta': 118000,
      'Cà phê Arabica': 229000,
      'Gạo thô': 5800,
      'Đường': 8500,
      'Cacao': 165000
    };
    return basePrices[product] || 50000;
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  const renderChart = () => {
    const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
          <Tooltip 
            formatter={(value) => [`${new Intl.NumberFormat('vi-VN').format(value)}đ`, '']}
            labelFormatter={(label) => `Ngày: ${label}`}
          />
          <Legend />
          
          {selectedProducts.map((product, index) => {
            if (chartType === 'area') {
              return (
                <Area
                  key={product}
                  type="monotone"
                  dataKey={product}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              );
            } else {
              return (
                <Line
                  key={product}
                  type="monotone"
                  dataKey={product}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              );
            }
          })}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Biểu đồ giá nâng cao
        </Typography>
        
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, value) => value && setChartType(value)}
            size="small"
          >
            <ToggleButton value="line">Đường</ToggleButton>
            <ToggleButton value="area">Vùng</ToggleButton>
          </ToggleButtonGroup>
          
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, value) => value && setTimeRange(value)}
            size="small"
          >
            <ToggleButton value="7d">7 ngày</ToggleButton>
            <ToggleButton value="30d">30 ngày</ToggleButton>
            <ToggleButton value="90d">90 ngày</ToggleButton>
          </ToggleButtonGroup>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sản phẩm</InputLabel>
            <Select
              multiple
              value={selectedProducts}
              onChange={(e) => setSelectedProducts(e.target.value)}
              label="Sản phẩm"
            >
              {products.map(product => (
                <MenuItem key={product} value={product}>
                  {product}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default AdvancedPriceChart;