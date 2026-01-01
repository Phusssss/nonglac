import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, MapPin } from 'lucide-react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ name: 'Hà Nội', lat: 21.0285, lon: 105.8542 });

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const cityName = await getCityName(latitude, longitude);
          setLocation({ name: cityName, lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation denied, using default location');
          fetchWeather(location.lat, location.lon);
        }
      );
    } else {
      fetchWeather(location.lat, location.lon);
    }
  };

  const getCityName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=vi`
      );
      const data = await response.json();
      return data.address?.city || data.address?.province || data.address?.state || 'Vị trí của bạn';
    } catch (error) {
      return 'Vị trí của bạn';
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Bangkok&forecast_days=5`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={64} />;
    if (code <= 3) return <Cloud size={64} />;
    if (code <= 67) return <CloudRain size={64} />;
    return <Wind size={64} />;
  };

  const getSmallWeatherIcon = (code) => {
    if (code === 0) return <Sun size={24} />;
    if (code <= 3) return <Cloud size={24} />;
    if (code <= 67) return <CloudRain size={24} />;
    return <Wind size={24} />;
  };

  const getDayName = (index) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    const day = new Date(today);
    day.setDate(today.getDate() + index);
    return days[day.getDay()];
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white mb-6 animate-pulse">
        <div className="h-32"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white mb-6">
      <h3 className="font-bold mb-2">Thời tiết nông vụ</h3>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1 text-sm mb-1">
            <MapPin size={14} />
            <p>{location.name}</p>
          </div>
          <p className="text-5xl font-bold">{Math.round(weather.current.temperature_2m)}°C</p>
        </div>
        {getWeatherIcon(weather.current.weathercode)}
      </div>
      <div className="flex justify-between text-sm">
        {weather.daily.time.slice(0, 5).map((date, index) => (
          <div key={index} className="text-center">
            <p className="mb-1">{getDayName(index)}</p>
            <div className="mx-auto my-1">
              {getSmallWeatherIcon(weather.daily.weathercode[index])}
            </div>
            <p className="text-xs">{Math.round(weather.daily.temperature_2m_max[index])}°</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;
