# Hướng dẫn Upload lên GitHub

## 1. Khởi tạo Git repository

```bash
cd "d:\Dự án\NongLac"
git init
git add .
git commit -m "Initial commit: NôngLạc social media platform"
```

## 2. Tạo repository trên GitHub

1. Đăng nhập GitHub
2. Tạo repository mới tên "NongLac"
3. Không tích "Initialize with README" (vì đã có sẵn)

## 3. Kết nối và push code

```bash
git remote add origin https://github.com/YOUR_USERNAME/NongLac.git
git branch -M main
git push -u origin main
```

## 4. Các file đã được loại trừ (.gitignore)

- `node_modules/` - Thư viện Node.js (nặng nhất)
- `build/` - File build production
- `.env` - File cấu hình môi trường
- Các file log và cache
- File IDE và OS

## 5. Sau khi clone về máy khác

```bash
git clone https://github.com/YOUR_USERNAME/NongLac.git
cd NongLac
npm install
```

Nhớ tạo file `.env` với cấu hình Firebase của bạn.