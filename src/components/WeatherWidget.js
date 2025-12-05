import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { WbSunny, Cloud, Grain, LocationOn } from '@mui/icons-material';

const WeatherWidget = ({ defaultLocation = 'Hồ Chí Minh' }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);

  const locations = [
    'Hồ Chí Minh',
    'Hà Nội', 
    'Đồng Tháp',
    'An Giang',
    'Cần Thơ',
    'Đắk Lắk',
    'Lâm Đồng',
    'Bình Dương',
    'Long An',
    'Tiền Giang'
  ];

  useEffect(() => {
    fetchWeather();
  }, [selectedLocation]);

  const fetchWeather = async () => {
    try {
      // Sử dụng WeatherAPI miễn phí
      const API_KEY = '34e500c4284245bb905123709252510'; // Thực tế cần đăng ký tại weatherapi.com
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${selectedLocation}&lang=vi`
      );
      
      if (response.ok) {
        const data = await response.json();
        const weatherData = {
          temperature: Math.round(data.current.temp_c),
          humidity: data.current.humidity,
          condition: getConditionFromWeather(data.current.condition.text),
          description: data.current.condition.text,
          windSpeed: data.current.wind_kph / 3.6, // Convert to m/s
          pressure: data.current.pressure_mb
        };
        setWeather(weatherData);
      } else {
        throw new Error('API không khả dụng');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Sử dụng dữ liệu giả lập thực tế hơn
      const mockWeather = {
        temperature: getRealisticTemp(selectedLocation),
        humidity: getRealisticHumidity(selectedLocation),
        condition: getRealisticCondition(),
        description: 'Dữ liệu mô phỏng',
        windSpeed: Math.random() * 5 + 2
      };
      setWeather(mockWeather);
      setLoading(false);
    }
  };

  const getRealisticTemp = (loc) => {
    const tempMap = {
      'Hồ Chí Minh': 28,
      'Hà Nội': 24,
      'Đồng Tháp': 29,
      'An Giang': 30,
      'Cần Thơ': 28,
      'Đắk Lắk': 26,
      'Lâm Đồng': 22,
      'Bình Dương': 27,
      'Long An': 29,
      'Tiền Giang': 28
    };
    const baseTemp = tempMap[loc] || 26;
    const variation = Math.random() * 4 - 2; // -2 to +2
    return Math.round(baseTemp + variation);
  };

  const getRealisticHumidity = (loc) => {
    return Math.floor(Math.random() * 20) + 70; // 70-90%
  };

  const getRealisticCondition = () => {
    const conditions = ['sunny', 'cloudy', 'rainy'];
    const weights = [0.5, 0.3, 0.2]; // 50% sunny, 30% cloudy, 20% rainy
    const random = Math.random();
    if (random < weights[0]) return conditions[0];
    if (random < weights[0] + weights[1]) return conditions[1];
    return conditions[2];
  };

  const getConditionFromWeather = (weatherText) => {
    const text = weatherText.toLowerCase();
    if (text.includes('nắng') || text.includes('sunny') || text.includes('clear')) return 'sunny';
    if (text.includes('mưa') || text.includes('rain') || text.includes('drizzle')) return 'rainy';
    if (text.includes('mây') || text.includes('cloud') || text.includes('overcast')) return 'cloudy';
    if (text.includes('sương') || text.includes('fog') || text.includes('mist')) return 'cloudy';
    return 'sunny';
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <WbSunny color="warning" />;
      case 'cloudy': return <Cloud color="action" />;
      case 'rainy': return <Grain color="primary" />;
      default: return <WbSunny />;
    }
  };

  const getAgricultureAdvice = (temp, humidity, condition) => {
    if (condition === 'rainy') return 'Chú ý thoát nước cho cây trồng';
    if (temp > 35) return 'Thời tiết nóng, cần tưới nước thường xuyên';
    if (humidity < 40) return 'Không khí khô, tăng cường tưới nước';
    if (humidity > 85) return 'Chú ý phòng chống bệnh nấm';
    return 'Thời tiết thuận lợi cho nông nghiệp';
  };

  if (loading) return <CircularProgress />;

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <LocationOn color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Thời tiết
            </Typography>
          </Box>
        </Box>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Chọn địa điểm</InputLabel>
          <Select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            label="Chọn địa điểm"
          >
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box display="flex" alignItems="center" mb={1}>
          {getWeatherIcon(weather.condition)}
          <Typography variant="h4" sx={{ ml: 1 }}>
            {weather.temperature}°C
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Độ ẩm: {weather.humidity}%
        </Typography>
        
        {weather.windSpeed && (
          <Typography variant="body2" color="text.secondary">
            Gió: {weather.windSpeed} m/s
          </Typography>
        )}
        
        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
          {getAgricultureAdvice(weather.temperature, weather.humidity, weather.condition)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;