# Backend API Requirements for Real-Time Agricultural Prices

## Overview
Backend cần cung cấp API endpoints để lấy giá nông sản thực tế từ internet thay vì dữ liệu giả.

## Required Endpoints

### 1. Search Agricultural Prices
**Endpoint**: `POST /api/prices/search`

**Purpose**: Tìm kiếm giá nông sản thực tế từ các nguồn trực tuyến

**Request Body**:
```json
{
  "query": "giá lúa hôm nay Đồng bằng sông Cửu Long",
  "product": "lúa",
  "region": "Đồng bằng sông Cửu Long"
}
```

**Response**:
```json
{
  "success": true,
  "product": "Lúa",
  "price": "6,500 - 7,000",
  "unit": "đồng/kg",
  "trend": "tăng nhẹ",
  "source": "Sở Nông nghiệp ĐBSCL",
  "lastUpdated": "hôm nay 14:30",
  "region": "Đồng bằng sông Cửu Long"
}
```

**Implementation Suggestions**:
- Sử dụng web scraping từ các nguồn tin cậy:
  - AgroInfo.vn
  - Sở Nông nghiệp các tỉnh
  - Cổng thông tin điện tử Bộ Nông nghiệp
  - Các trang tin tức nông nghiệp
- Cache kết quả trong 1-2 giờ để giảm tải
- Fallback về dữ liệu lịch sử nếu không tìm được giá mới

### 2. Get Price Trend
**Endpoint**: `POST /api/prices/trend`

**Purpose**: Lấy xu hướng giá theo thời gian

**Request Body**:
```json
{
  "product": "cà phê",
  "timeframe": "7days"
}
```

**Response**:
```json
{
  "success": true,
  "product": "Cà phê",
  "trend": "tăng",
  "percentChange": "+5.2%",
  "data": [
    { "date": "2026-02-03", "price": 45000 },
    { "date": "2026-02-04", "price": 46000 },
    { "date": "2026-02-05", "price": 47000 }
  ]
}
```

## Data Sources (Recommended)

### Vietnamese Agricultural Price Sources:
1. **AgroInfo.vn** - Cổng thông tin nông nghiệp
2. **Bộ Nông nghiệp và Phát triển nông thôn** - Giá chính thức
3. **Sở Nông nghiệp các tỉnh** - Giá địa phương
4. **VnExpress Kinh doanh** - Tin tức giá nông sản
5. **Cafef.vn** - Giá cà phê, cao su
6. **Vietstock.vn** - Giá hàng hóa nông sản

### Web Scraping Strategy:
```javascript
// Example using Puppeteer or Cheerio
async function scrapeAgriculturalPrice(product, region) {
  // 1. Build search query
  const searchQuery = `giá ${product} hôm nay ${region}`;
  
  // 2. Search on trusted sources
  const sources = [
    'https://agroinfo.vn',
    'https://www.mard.gov.vn',
    // ... other sources
  ];
  
  // 3. Extract price data
  // 4. Validate and format
  // 5. Return structured data
}
```

### Alternative: Use Existing APIs
- **Agribank API** (nếu có partnership)
- **Government Open Data** (data.gov.vn)
- **Third-party agricultural data providers**

## Error Handling

### When Real Data Unavailable:
```json
{
  "success": false,
  "product": "lúa",
  "message": "Không tìm thấy giá thực tế",
  "fallback": {
    "price": "6,500 - 7,000",
    "unit": "đồng/kg",
    "note": "Giá tham khảo từ tuần trước"
  }
}
```

## Security & Rate Limiting
- Implement rate limiting: 100 requests/hour per user
- Cache results to reduce external API calls
- Validate input to prevent injection attacks
- Use HTTPS for all external requests

## Testing
```bash
# Test price search
curl -X POST http://localhost:3001/api/prices/search \
  -H "Content-Type: application/json" \
  -d '{"query":"giá lúa hôm nay","product":"lúa","region":"Việt Nam"}'

# Test price trend
curl -X POST http://localhost:3001/api/prices/trend \
  -H "Content-Type: application/json" \
  -d '{"product":"cà phê","timeframe":"7days"}'
```

## Implementation Priority
1. **High Priority**: `/api/prices/search` - Core functionality
2. **Medium Priority**: `/api/prices/trend` - Enhanced features
3. **Low Priority**: Historical data, advanced analytics

## Notes for Backend Developer
- Giá nông sản thay đổi theo thời gian thực, cần cập nhật thường xuyên
- Mỗi vùng miền có giá khác nhau, cần xử lý region parameter
- Một số sản phẩm có nhiều giống (ví dụ: lúa OM5451, lúa Jasmine), cần xử lý chi tiết
- Cần xử lý các đơn vị khác nhau: đồng/kg, đồng/tấn, USD/tấn
- Implement caching để giảm tải cho external sources
