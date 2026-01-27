import React from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { Lock } from 'lucide-react';

const { Title, Text } = Typography;

const ADMIN_SECURITY_CODE = 'NL_2026_AD_8f2a9c1b7d';

const AdminSecurityGate = ({ securityCode, setSecurityCode, setIsAuthenticated }) => {
  const handleSecurityCodeSubmit = () => {
    if (securityCode === ADMIN_SECURITY_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      message.success('Đăng nhập thành công!');
    } else {
      message.error('Mã bảo mật không đúng!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Lock className="w-16 h-16 text-[#795548] mx-auto mb-4" />
          <Title level={2} className="text-[#795548]">Admin Dashboard</Title>
          <Text type="secondary">Nhập mã bảo mật để truy cập</Text>
        </div>
        
        <div className="space-y-4">
          <Input.Password
            placeholder="Nhập mã bảo mật"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            onPressEnter={handleSecurityCodeSubmit}
            size="large"
          />
          <Button 
            type="primary" 
            size="large" 
            block
            onClick={handleSecurityCodeSubmit}
            className="bg-[#795548] hover:bg-[#6d4c41]"
          >
            Xác thực
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSecurityGate;