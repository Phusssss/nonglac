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
      const result = await weatherService.getWeatherForCurrentLocation();
      
      setWeather(result.weather);
      setLocation(result.location);
      setLastUpdate(new Date());
      
      // Removed noisy logs
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
      <div className="mb-6 bg-gradient-to-br from-[#4CAF50] to-teal-600 rounded-2xl p-5 text-white shadow-[0_4px_20px_-4px_rgba(16,185,129,0.3)] border border-green-400/30 relative overflow-hidden">
        <div className="flex items-center justify-center h-32">
          <Spin size="large" />
          <span className="ml-3 font-medium">Đang tải thời tiết...</span>
        </div>
      </div>
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
    <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 flex items-center justify-between">
        <h3 className="font-bold text-[15px] text-slate-800 flex items-center gap-2">
          <MapPin size={16} className="text-emerald-600" />
          Thời tiết {location.name}
        </h3>
        <Button 
          type="text" 
          onClick={handleRetry}
          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-1 flex items-center justify-center rounded-lg transition-colors border-none"
          icon={<RefreshCw size={14} />}
          title="Cập nhật thời tiết"
        />
      </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-4xl font-bold text-slate-800 tracking-tight">{Math.round(weather.current.temperature_2m)}°C</p>
                {lastUpdate && (
                  <Tooltip title={`Cập nhật lúc ${lastUpdate.toLocaleTimeString()}`}>
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      {lastUpdate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Tooltip>
                )}
              </div>
              <p className="text-sm font-medium text-emerald-600">{weatherService.getWeatherDescription(weather.current.weathercode)}</p>
              
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                {weather.current.relative_humidity_2m && (
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <Droplets size={12} className="text-blue-500" />
                    <span>{weather.current.relative_humidity_2m}%</span>
                  </div>
                )}
                {weather.current.apparent_temperature && (
                  <div className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    Cảm giác {Math.round(weather.current.apparent_temperature)}°C
                  </div>
                )}
              </div>
            </div>
            <div className="text-center flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 min-w-[80px]">
              <div className="text-emerald-500 drop-shadow-sm">
                {getWeatherIcon(weather.current.weathercode)}
              </div>
              {weather.current.windspeed_10m && (
                <p className="text-[11px] mt-1.5 font-medium text-slate-500 flex items-center gap-1">
                  <Wind size={10} />
                  {Math.round(weather.current.windspeed_10m)} km/h
                </p>
              )}
            </div>
          </div>

          {/* Weather advice for farmers */}
          {weatherService.getWeatherAdvice(weather.current.weathercode, weather.current.temperature_2m).length > 0 && (
            <div className="bg-emerald-50/50 rounded-xl p-3 mb-4 border border-emerald-100/50">
              <p className="text-xs font-bold mb-1.5 text-emerald-700 flex items-center gap-1.5">
                <span className="text-emerald-500">💡</span> Lời khuyên nông vụ
              </p>
              {weatherService.getWeatherAdvice(weather.current.weathercode, weather.current.temperature_2m).map((advice, index) => (
                <p key={index} className="text-[11px] text-slate-600 mb-1 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-1.5 before:top-1.5 before:w-1 before:h-1 before:bg-emerald-400 before:rounded-full">{advice}</p>
              ))}
            </div>
          )}
        
          <div className="border-t border-slate-100 pt-3">
            <div className="flex justify-between text-sm">
              {weather.daily.time.slice(0, 5).map((date, index) => (
                <div key={index} className="text-center flex-1">
                  <p className="mb-1 text-[11px] font-medium text-slate-500">{getDayName(index)}</p>
                  <div className="mx-auto my-2 flex justify-center text-slate-600 [&_svg]:!w-5 [&_svg]:!h-5">
                    {getSmallWeatherIcon(weather.daily.weathercode[index])}
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {Math.round(weather.daily.temperature_2m_max[index])}°
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {Math.round(weather.daily.temperature_2m_min[index])}°
                  </p>
                  {weather.daily.precipitation_sum && weather.daily.precipitation_sum[index] > 0 && (
                    <p className="text-[9px] text-blue-400 font-medium mt-1 bg-blue-50 rounded-sm py-0.5 w-fit mx-auto px-1">
                      {Math.round(weather.daily.precipitation_sum[index])}mm
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default WeatherWidget;
