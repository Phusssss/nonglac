// Service sử dụng API địa chỉ Việt Nam thật
class VietnamAddressService {
  constructor() {
    this.baseURL = 'https://provinces.open-api.vn/api';
    this.cache = {
      provinces: null,
      districts: {},
      wards: {}
    };
  }

  // Lấy danh sách tỉnh/thành phố
  async getProvinces() {
    if (this.cache.provinces) {
      return this.cache.provinces;
    }

    try {
      const response = await fetch(`${this.baseURL}/p/`);
      const data = await response.json();
      
      this.cache.provinces = data.map(province => ({
        code: province.code,
        name: province.name,
        codename: province.codename
      }));
      
      return this.cache.provinces;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }

  // Lấy danh sách quận/huyện theo tỉnh
  async getDistricts(provinceCode) {
    const cacheKey = `districts_${provinceCode}`;
    
    if (this.cache.districts[cacheKey]) {
      return this.cache.districts[cacheKey];
    }

    try {
      const response = await fetch(`${this.baseURL}/p/${provinceCode}?depth=2`);
      const data = await response.json();
      
      const districts = data.districts.map(district => ({
        code: district.code,
        name: district.name,
        codename: district.codename
      }));
      
      this.cache.districts[cacheKey] = districts;
      return districts;
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  // Lấy danh sách phường/xã theo quận/huyện
  async getWards(districtCode) {
    const cacheKey = `wards_${districtCode}`;
    
    if (this.cache.wards[cacheKey]) {
      return this.cache.wards[cacheKey];
    }

    try {
      const response = await fetch(`${this.baseURL}/d/${districtCode}?depth=2`);
      const data = await response.json();
      
      const wards = data.wards.map(ward => ({
        code: ward.code,
        name: ward.name,
        codename: ward.codename
      }));
      
      this.cache.wards[cacheKey] = wards;
      return wards;
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  }

  // Validate địa chỉ
  async validateAddress(provinceCode, districtCode, wardCode) {
    try {
      const provinces = await this.getProvinces();
      const province = provinces.find(p => String(p.code) === String(provinceCode));
      
      if (!province) {
        return { valid: false, error: 'Tỉnh không hợp lệ' };
      }

      if (districtCode) {
        const districts = await this.getDistricts(provinceCode);
        const district = districts.find(d => String(d.code) === String(districtCode));
        
        if (!district) {
          return { valid: false, error: 'Quận/Huyện không hợp lệ' };
        }

        if (wardCode) {
          const wards = await this.getWards(districtCode);
          const ward = wards.find(w => String(w.code) === String(wardCode));
          
          if (!ward) {
            return { valid: false, error: 'Phường/Xã không hợp lệ' };
          }
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating address:', error);
      return { valid: false, error: 'Lỗi khi kiểm tra địa chỉ' };
    }
  }

  // Lấy thông tin chi tiết địa chỉ
  async getAddressDetails(provinceCode, districtCode, wardCode) {
    try {
      const [provinces, districts, wards] = await Promise.all([
        this.getProvinces(),
        this.getDistricts(provinceCode),
        this.getWards(districtCode)
      ]);

      const province = provinces.find(p => String(p.code) === String(provinceCode));
      const district = districts.find(d => String(d.code) === String(districtCode));
      const ward = wards.find(w => String(w.code) === String(wardCode));

      return {
        province: province?.name || '',
        district: district?.name || '',
        ward: ward?.name || '',
        fullAddress: `${ward?.name || ''}, ${district?.name || ''}, ${province?.name || ''}`.replace(/^, |, $/, '')
      };
    } catch (error) {
      console.error('Error getting address details:', error);
      return {
        province: '',
        district: '',
        ward: '',
        fullAddress: ''
      };
    }
  }

  // Tìm kiếm tỉnh theo tên
  async findProvinceByName(provinceName) {
    try {
      const provinces = await this.getProvinces();
      return provinces.find(province => 
        province.name.toLowerCase().includes(provinceName.toLowerCase()) ||
        province.codename.toLowerCase().includes(provinceName.toLowerCase())
      );
    } catch (error) {
      console.error('Error finding province:', error);
      return null;
    }
  }

  // Tìm kiếm địa chỉ
  async searchAddress(query) {
    try {
      const provinces = await this.getProvinces();
      return provinces.filter(province => 
        province.name.toLowerCase().includes(query.toLowerCase()) ||
        province.codename.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching address:', error);
      return [];
    }
  }

  // Debug: Kiểm tra dữ liệu tỉnh
  async debugProvinceData() {
    try {
      const provinces = await this.getProvinces();
      console.log('Tất cả tỉnh thành:', provinces);
      
      const lamDong = provinces.find(p => 
        p.name.toLowerCase().includes('lâm') || 
        p.name.toLowerCase().includes('lam')
      );
      console.log('Tìm thấy Lâm Đồng:', lamDong);
      
      return provinces;
    } catch (error) {
      console.error('Lỗi debug:', error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.cache = {
      provinces: null,
      districts: {},
      wards: {}
    };
  }
}

const vietnamAddressService = new VietnamAddressService();
export default vietnamAddressService;