import { getErrorMessage } from '../constants/errorMessages';

class WeatherService {
  constructor() {
    this.baseURL = 'https://api.open-meteo.com/v1';
    this.geocodingURL = 'https://nominatim.openstreetmap.org';
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Get weather data with caching
  async getWeather(lat, lon, options = {}) {
    const cacheKey = `weather_${lat}_${lon}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,weathercode,windspeed_10m,relative_humidity_2m,apparent_temperature',
        daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max',
        timezone: 'Asia/Bangkok',
        forecast_days: options.days || 5
      });

      const url = `${this.baseURL}/forecast?${params}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.current || !data.daily) {
        throw new Error('Invalid weather data structure');
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('❌ Weather service error:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Kết nối bị timeout. Vui lòng thử lại.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến dịch vụ thời tiết. Kiểm tra kết nối internet.');
      } else {
        throw new Error(getErrorMessage(error) || 'Không thể tải dữ liệu thời tiết.');
      }
    }
  }

  // Get city name from coordinates
  async getCityName(lat, lon) {
    const cacheKey = `city_${lat}_${lon}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${this.geocodingURL}/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=vi`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
      }

      const data = await response.json();
      const cityName = data.address?.city || 
                     data.address?.province || 
                     data.address?.state || 
                     data.address?.county ||
                     data.address?.town ||
                     'Vị trí của bạn';

      // Cache the result
      this.cache.set(cacheKey, {
        data: cityName,
        timestamp: Date.now()
      });

      return cityName;
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Vị trí của bạn';
    }
  }

  // Get user's current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation không được hỗ trợ'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Không thể lấy vị trí hiện tại';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Quyền truy cập vị trí bị từ chối';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Thông tin vị trí không khả dụng';
              break;
            case error.TIMEOUT:
              message = 'Timeout khi lấy vị trí';
              break;
          }
          reject(new Error(message));
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 5 * 60 * 1000 // 5 minutes
        }
      );
    });
  }

  // Get weather for current location
  async getWeatherForCurrentLocation() {
    try {
      const location = await this.getCurrentLocation();
      
      const [weather, cityName] = await Promise.all([
        this.getWeather(location.lat, location.lon),
        this.getCityName(location.lat, location.lon)
      ]);

      return {
        weather,
        location: {
          name: cityName,
          lat: location.lat,
          lon: location.lon
        }
      };
    } catch (error) {
      // Fallback to default location (Hanoi)
      const defaultLat = 21.0285;
      const defaultLon = 105.8542;
      
      const weather = await this.getWeather(defaultLat, defaultLon);
      
      return {
        weather,
        location: {
          name: 'Hà Nội (Mặc định)',
          lat: defaultLat,
          lon: defaultLon
        }
      };
    }
  }

  // Weather interpretation helpers
  getWeatherDescription(code) {
    const descriptions = {
      0: 'Trời quang',
      1: 'Ít mây',
      2: 'Có mây',
      3: 'Nhiều mây',
      45: 'Sương mù',
      48: 'Sương mù đóng băng',
      51: 'Mưa phùn nhẹ',
      53: 'Mưa phùn vừa',
      55: 'Mưa phùn nặng',
      61: 'Mưa nhẹ',
      63: 'Mưa vừa',
      65: 'Mưa to',
      71: 'Tuyết nhẹ',
      73: 'Tuyết vừa',
      75: 'Tuyết to',
      95: 'Dông',
      96: 'Dông có mưa đá nhẹ',
      99: 'Dông có mưa đá to'
    };

    return descriptions[code] || 'Không xác định';
  }

  getWeatherAdvice(code, temperature) {
    const advice = [];

    // Temperature advice
    if (temperature > 35) {
      advice.push('🌡️ Thời tiết rất nóng, tránh làm việc ngoài trời vào giữa trưa');
    } else if (temperature > 30) {
      advice.push('☀️ Thời tiết nóng, nhớ uống nhiều nước khi làm việc');
    } else if (temperature < 15) {
      advice.push('🧥 Thời tiết lạnh, mặc ấm khi ra ngoài');
    }

    // Weather condition advice
    if (code >= 61 && code <= 65) {
      advice.push('🌧️ Có mưa, hoãn các công việc ngoài trời nếu có thể');
    } else if (code >= 95) {
      advice.push('⛈️ Có dông, tránh ra ngoài và bảo vệ cây trồng');
    } else if (code === 0) {
      advice.push('🌱 Thời tiết thuận lợi cho các hoạt động nông nghiệp');
    }

    return advice;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

const weatherService = new WeatherService();
export default weatherService;