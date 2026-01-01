const fs = require('fs');
const path = require('path');

// Tạo build time
const buildTime = Date.now();

// Đọc file .env hiện tại
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Cập nhật hoặc thêm REACT_APP_BUILD_TIME
const buildTimeRegex = /^REACT_APP_BUILD_TIME=.*$/m;
const newBuildTimeLine = `REACT_APP_BUILD_TIME=${buildTime}`;

if (buildTimeRegex.test(envContent)) {
  envContent = envContent.replace(buildTimeRegex, newBuildTimeLine);
} else {
  envContent += `\n${newBuildTimeLine}\n`;
}

// Ghi lại file .env
fs.writeFileSync(envPath, envContent);

console.log(`✅ Build time updated: ${buildTime}`);