import React from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { Lock } from 'lucide-react';
import { ADMIN_CONSTANTS } from '../constants';

const { Title, Text } = Typography;

const AdminSecurityGate = ({ securityCode, setSecurityCode, setIsAuthenticated }) => {
  const handleSecurityCodeSubmit = () => {
    if (securityCode === ADMIN_CONSTANTS.SECURITY_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      message.success('Đăng nhập thành công!');
    } else {
      message.error('Mã bảo mật không đúng!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-none rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-agri-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-agri-600" />
          </div>
          <Title level={2} className="text-agri-800 m-0">Admin Access</Title>
          <Text type="secondary" className="text-gray-500">Nhập mã bảo mật để quản trị hệ thống</Text>
        </div>
        
        <div className="space-y-5">
          <div>
            <Text strong className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Security Code</Text>
            <Input.Password
              placeholder="••••••••••••"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              onPressEnter={handleSecurityCodeSubmit}
              size="large"
              className="rounded-xl h-12"
            />
          </div>
          <Button 
            type="primary" 
            size="large" 
            block
            onClick={handleSecurityCodeSubmit}
            className="bg-agri-600 hover:bg-agri-700 border-none h-12 rounded-xl font-bold shadow-lg shadow-agri-100"
          >
            Xác thực truy cập
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Text className="text-[10px] text-gray-400 uppercase tracking-tighter">
            © 2026 NôngLạc - Secure Administration Environment
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminSecurityGate;