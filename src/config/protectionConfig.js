// Protection system configuration
export const protectionConfig = {
  // Enable/disable entire protection system
  enabled: false,
  
  // Individual feature toggles
  devToolsDetection: false,
  consoleProtection: false,
  keyboardProtection: false,
  
  // Warning configuration
  warningLevel: 'critical', // 'info' | 'warning' | 'critical'
  violationThreshold: 3, // Number of violations before auto-logout
  autoLogout: false,
  
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
