const fs = require('fs');
const path = require('path');

// Hàm tăng version
function incrementVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
    default:
      return currentVersion;
  }
  
  return parts.join('.');
}

// Lấy version từ package.json hoặc argument
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const versionType = process.argv[2]; // patch, minor, major, hoặc version cụ thể
let newVersion;

if (['patch', 'minor', 'major'].includes(versionType)) {
  // Tự động tăng version
  newVersion = incrementVersion(packageJson.version, versionType);
  
  // Cập nhật package.json
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  
  console.log(`📦 Updated package.json version: ${packageJson.version} -> ${newVersion}`);
} else if (versionType) {
  // Version cụ thể được cung cấp
  newVersion = versionType;
} else {
  // Sử dụng version hiện tại từ package.json
  newVersion = packageJson.version;
}

console.log(`🔄 Updating version to: ${newVersion}`);

// Cập nhật .env file
const envPath = '.env';
let envContent = fs.readFileSync(envPath, 'utf8');

// Update version
if (envContent.includes('REACT_APP_VERSION=')) {
  envContent = envContent.replace(/REACT_APP_VERSION=.*/, `REACT_APP_VERSION=${newVersion}`);
} else {
  envContent += `\nREACT_APP_VERSION=${newVersion}`;
}

// Update build time
const buildTime = Date.now();
if (envContent.includes('REACT_APP_BUILD_TIME=')) {
  envContent = envContent.replace(/REACT_APP_BUILD_TIME=.*/, `REACT_APP_BUILD_TIME=${buildTime}`);
} else {
  envContent += `\nREACT_APP_BUILD_TIME=${buildTime}`;
}

fs.writeFileSync(envPath, envContent);

// Cập nhật .env.production nếu có
const envProdPath = '.env.production';
if (fs.existsSync(envProdPath)) {
  let envProdContent = fs.readFileSync(envProdPath, 'utf8');
  
  if (envProdContent.includes('REACT_APP_VERSION=')) {
    envProdContent = envProdContent.replace(/REACT_APP_VERSION=.*/, `REACT_APP_VERSION=${newVersion}`);
  } else {
    envProdContent += `\nREACT_APP_VERSION=${newVersion}`;
  }
  
  if (envProdContent.includes('REACT_APP_BUILD_TIME=')) {
    envProdContent = envProdContent.replace(/REACT_APP_BUILD_TIME=.*/, `REACT_APP_BUILD_TIME=${buildTime}`);
  } else {
    envProdContent += `\nREACT_APP_BUILD_TIME=${buildTime}`;
  }
  
  fs.writeFileSync(envProdPath, envProdContent);
  console.log(`✅ Updated .env.production with version ${newVersion}`);
}

console.log(`✅ Updated .env with version ${newVersion} and build time ${buildTime}`);
console.log(`📝 Remember to update Firebase version using admin panel after deployment!`);

// Hiển thị thông tin version
console.log(`\n📊 Version Summary:`);
console.log(`   Package.json: ${packageJson.version}`);
console.log(`   Environment: ${newVersion}`);
console.log(`   Build Time: ${new Date(buildTime).toLocaleString()}`);
console.log(`\n🚀 Ready to build and deploy!`);