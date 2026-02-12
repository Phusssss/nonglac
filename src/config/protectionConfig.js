// Protection system configuration
export const protectionConfig = {
  // Enable/disable entire protection system
  enabled: true,
  
  // Individual feature toggles
  devToolsDetection: true,
  consoleProtection: true,
  keyboardProtection: true,
  
  // Warning configuration
  warningLevel: 'critical', // 'info' | 'warning' | 'critical'
  violationThreshold: 3, // Number of violations before auto-logout
  autoLogout: true,
  
  // Custom messages (Vietnamese)
  customMessages: {
    warningTitle: '⚠️ CẢNH BÁO BẢO MẬT',
    warningContent: 'Hệ thống đã phát hiện hành vi cố gắng truy cập mã nguồn. Vui lòng đóng Developer Tools để tiếp tục sử dụng ứng dụng.'
  },
  
  // Whitelist (optional - for admin/dev access)
  whitelist: {
    ipAddresses: [],
    userRoles: ['super_admin'] // Users with these roles bypass protection
  }
};

export default protectionConfig;
