# Price Scraper Server

Server Node.js để cào dữ liệu giá nông sản thực tế từ các nguồn trực tuyến.

## Cài đặt

```bash
cd server
npm install
```

## Chạy server

```bash
npm start
# hoặc development mode
npm run dev
```

Server sẽ chạy trên port 3001.

## API Endpoints

- `GET /api/prices` - Lấy tất cả giá nông sản
- `GET /api/prices/category/:category` - Lấy giá theo danh mục
- `POST /api/prices/refresh` - Cập nhật giá mới

## Nguồn dữ liệu

- nongnghiep.vn - Giá nông sản Việt Nam
- VietStock API - Dữ liệu thị trường
- Tự động cập nhật mỗi 30 phút

## Chạy cả frontend và backend

1. Terminal 1 - Backend:
```bash
cd server
npm install
npm start
```

2. Terminal 2 - Frontend:
```bash
npm install
npm start
```