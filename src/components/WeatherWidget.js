import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, MapPin, AlertCircle, RefreshCw, Droplets } from 'lucide-react';
import { Card, Spin, Button, message, Tooltip } from 'antd';
import { ErrorDisplay } from './common';
import weatherService from '../services/weatherService';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ name: 'Hà Nội', lat: 21.0285, lon: 105.8542 });
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🌤️ Loading weather data...');
      const result = await weatherService.getWeatherForCurrentLocation();
      console.log('🌤️ Weather data received:', result);
      
      setWeather(result.weather);
      setLocation(result.location);
      setLastUpdate(new Date());
      
      // Log detailed weather info for debugging
      console.log('🌡️ Current temperature:', result.weather.current.temperature_2m);
      console.log('🌤️ Weather code:', result.weather.current.weathercode);
      console.log('📍 Location:', result.location.name);
      
      message.success(`Cập nhật thời tiết ${result.location.name}: ${Math.round(result.weather.current.temperature_2m)}°C`);
    } catch (err) {
      console.error('❌ Error loading weather:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadWeatherData();
  };

  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing weather data...');
    weatherService.clearCache();
    loadWeatherData();
  };

  const handleTestGeolocation = () => {
    console.log('🧪 Testing geolocation manually...');
    
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      message.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Manual geolocation test successful:', {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        message.success(`Vị trí: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        
        // Force refresh with new location
        weatherService.clearCache();
        loadWeatherData();
      },
      (error) => {
        console.error('❌ Manual geolocation test failed:', error);
        let errorMsg = 'Lỗi định vị: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Quyền truy cập bị từ chối';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Vị trí không khả dụng';
            break;
          case error.TIMEOUT:
            errorMsg += 'Timeout';
            break;
          default:
            errorMsg += error.message;
        }
        message.error(errorMsg);
      },
      {
        timeout: 15000,
        enableHighAccuracy: true,
        maximumAge: 0 // Force fresh location
      }
    );
  };

  const getWeatherIcon = (code) => {
    const iconProps = { className: "text-white drop-shadow-lg" };
    if (code === 0) return <Sun size={64} {...iconProps} />;
    if (code <= 3) return <Cloud size={64} {...iconProps} />;
    if (code <= 67) return <CloudRain size={64} {...iconProps} />;
    return <Wind size={64} {...iconProps} />;
  };

  const getSmallWeatherIcon = (code) => {
    const iconProps = { className: "text-white" };
    if (code === 0) return <Sun size={24} {...iconProps} />;
    if (code <= 3) return <Cloud size={24} {...iconProps} />;
    if (code <= 67) return <CloudRain size={24} {...iconProps} />;
    return <Wind size={24} {...iconProps} />;
  };

  const getWeatherDescription = (code) => {
    return weatherService.getWeatherDescription(code);
  };

  const getDayName = (index) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    const day = new Date(today);
    day.setDate(today.getDate() + index);
    return index === 0 ? 'Hôm nay' : days[day.getDay()];
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-center h-32">
            <Spin size="large" />
            <span className="ml-2">Đang tải thời tiết...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          showRetry={true}
          showSupport={false}
        />
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="mb-6">
        <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg p-4 text-white text-center">
          <AlertCircle size={48} className="mx-auto mb-2" />
          <p>Không có dữ liệu thời tiết</p>
          <Button 
            type="link" 
            onClick={handleRetry}
            className="text-white hover:text-gray-200 p-0 mt-2"
            icon={<RefreshCw size={16} />}
          >
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">Thời tiết nông vụ</h3>
          <div className="flex gap-1">
            <Button 
              type="text" 
              onClick={handleRetry}
              className="text-white hover:text-gray-200 p-1"
              icon={<RefreshCw size={16} />}
              title="Cập nhật thời tiết"
            />
            <Button 
              type="text" 
              onClick={handleForceRefresh}
              className="text-white hover:text-gray-200 p-1 text-xs"
              title="Force refresh (clear cache)"
            >
              🔄
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1 text-sm mb-1 opacity-90">
              <MapPin size={14} />
              <p>{location.name}</p>
              {lastUpdate && (
                <Tooltip title={`Cập nhật lúc ${lastUpdate.toLocaleTimeString()}`}>
                  <span className="text-xs opacity-60 ml-2">
                    • {lastUpdate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </Tooltip>
              )}
            </div>
            <p className="text-5xl font-bold mb-1">{Math.round(weather.current.temperature_2m)}°C</p>
            <p className="text-sm opacity-90">{weatherService.getWeatherDescription(weather.current.weathercode)}</p>
            
            <div className="flex items-center gap-4 mt-2 text-xs opacity-75">
              {weather.current.relative_humidity_2m && (
                <div className="flex items-center gap-1">
                  <Droplets size={12} />
                  <span>{weather.current.relative_humidity_2m}%</span>
                </div>
              )}
              {weather.current.apparent_temperature && (
                <div>
                  Cảm giác: {Math.round(weather.current.apparent_temperature)}°C
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            {getWeatherIcon(weather.current.weathercode)}
            {weather.current.windspeed_10m && (
              <p className="text-xs mt-2 opacity-75">
                <Wind size={12} className="inline mr-1" />
                {Math.round(weather.current.windspeed_10m)} km/h
              </p>
            )}
          </div>
        </div>

        {/* Weather advice for farmers */}
        {weatherService.getWeatherAdvice(weather.current.weathercode, weather.current.temperature_2m).length > 0 && (
          <div className="bg-white/10 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold mb-1 opacity-90">💡 Lời khuyên nông vụ:</p>
            {weatherService.getWeatherAdvice(weather.current.weathercode, weather.current.temperature_2m).map((advice, index) => (
              <p key={index} className="text-xs opacity-80 mb-1">{advice}</p>
            ))}
          </div>
        )}
        
        <div className="border-t border-white/20 pt-3">
          <div className="flex justify-between text-sm">
            {weather.daily.time.slice(0, 5).map((date, index) => (
              <div key={index} className="text-center flex-1">
                <p className="mb-1 text-xs opacity-90">{getDayName(index)}</p>
                <div className="mx-auto my-2 flex justify-center">
                  {getSmallWeatherIcon(weather.daily.weathercode[index])}
                </div>
                <p className="text-xs font-semibold">
                  {Math.round(weather.daily.temperature_2m_max[index])}°
                </p>
                <p className="text-xs opacity-75">
                  {Math.round(weather.daily.temperature_2m_min[index])}°
                </p>
                {weather.daily.precipitation_sum && weather.daily.precipitation_sum[index] > 0 && (
                  <p className="text-xs opacity-75 mt-1">
                    {Math.round(weather.daily.precipitation_sum[index])}mm
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
