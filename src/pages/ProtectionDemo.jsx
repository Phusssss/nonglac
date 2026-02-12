import React from 'react';
import { Card, Typography, Space, Button, Tag, Divider } from 'antd';
import { ShieldCheck, ShieldAlert, Lock, Eye, EyeOff } from 'lucide-react';
import { useProtection } from '../contexts/ProtectionContext';

const { Title, Text, Paragraph } = Typography;

const ProtectionDemo = () => {
  const {
    isActive,
    isDevToolsOpen,
    violationCount,
    showWarning,
    restrictedMode
  } = useProtection();

  const testConsole = () => {
    console.log('Test log - Sẽ không hiển thị trong production');
    console.warn('Test warning - Sẽ không hiển thị trong production');
    console.error('Test error - Sẽ được redirect to Sentry');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Card>
          <Space align="center" size="large">
            <ShieldCheck size={48} color="#52c41a" />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                🛡️ Hệ Thống Bảo Vệ Code
              </Title>
              <Text type="secondary">
                Demo và kiểm tra các tính năng bảo vệ
              </Text>
            </div>
          </Space>
        </Card>

        {/* Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <Card>
            <Space direction="vertical" size="small">
              <Text type="secondary">Trạng Thái Protection</Text>
              <div>
                {isActive ? (
                  <Tag color="success" icon={<Lock size={14} />}>
                    ĐANG HOẠT ĐỘNG
                  </Tag>
                ) : (
                  <Tag color="default">
                    TẮT (Development Mode)
                  </Tag>
                )}
              </div>
              <Text style={{ fontSize: '12px' }}>
                {isActive 
                  ? 'Tất cả protections đang active' 
                  : 'Chỉ hoạt động trong production'}
              </Text>
            </Space>
          </Card>

          <Card>
            <Space direction="vertical" size="small">
              <Text type="secondary">DevTools Status</Text>
              <div>
                {isDevToolsOpen ? (
                  <Tag color="error" icon={<EyeOff size={14} />}>
                    ĐANG MỞ
                  </Tag>
                ) : (
                  <Tag color="success" icon={<Eye size={14} />}>
                    ĐÓNG
                  </Tag>
                )}
              </div>
              <Text style={{ fontSize: '12px' }}>
                {isDevToolsOpen 
                  ? 'DevTools đã được phát hiện' 
                  : 'DevTools không được phát hiện'}
              </Text>
            </Space>
          </Card>

          <Card>
            <Space direction="vertical" size="small">
              <Text type="secondary">Số Lần Vi Phạm</Text>
              <div>
                <Tag color={violationCount >= 3 ? 'error' : violationCount > 0 ? 'warning' : 'success'}>
                  {violationCount} / 3
                </Tag>
              </div>
              <Text style={{ fontSize: '12px' }}>
                {violationCount >= 3 
                  ? '⚠️ Sẽ logout tự động' 
                  : `Còn ${3 - violationCount} lần`}
              </Text>
            </Space>
          </Card>

          <Card>
            <Space direction="vertical" size="small">
              <Text type="secondary">Chế Độ Hạn Chế</Text>
              <div>
                {restrictedMode ? (
                  <Tag color="error" icon={<ShieldAlert size={14} />}>
                    BẬT
                  </Tag>
                ) : (
                  <Tag color="success">
                    TẮT
                  </Tag>
                )}
              </div>
              <Text style={{ fontSize: '12px' }}>
                {restrictedMode 
                  ? 'Một số tính năng bị hạn chế' 
                  : 'Tất cả tính năng hoạt động'}
              </Text>
            </Space>
          </Card>
        </div>

        {/* Features */}
        <Card title="✨ Tính Năng Bảo Vệ">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Title level={5}>1. Console Protection</Title>
              <Paragraph>
                Tất cả console logs (log, warn, info, debug, table, trace) bị vô hiệu hóa trong production.
                Console.error được redirect to Sentry.
              </Paragraph>
              <Button onClick={testConsole}>
                Test Console (Mở DevTools để xem)
              </Button>
            </div>

            <Divider />

            <div>
              <Title level={5}>2. DevTools Detection</Title>
              <Paragraph>
                Phát hiện khi DevTools được mở bằng 3 kỹ thuật:
              </Paragraph>
              <ul>
                <li>Window size detection (outerWidth - innerWidth)</li>
                <li>Debugger timing check</li>
                <li>Console toString override</li>
              </ul>
              <Text type="secondary">
                Thử mở DevTools (F12) để xem cảnh báo
              </Text>
            </div>

            <Divider />

            <div>
              <Title level={5}>3. Keyboard Protection</Title>
              <Paragraph>
                Các phím tắt sau bị chặn trong production:
              </Paragraph>
              <Space wrap>
                <Tag>F12</Tag>
                <Tag>Ctrl+Shift+I</Tag>
                <Tag>Ctrl+Shift+J</Tag>
                <Tag>Ctrl+Shift+C</Tag>
                <Tag>Ctrl+U</Tag>
                <Tag>Ctrl+S</Tag>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={5}>4. Right-Click Protection</Title>
              <Paragraph>
                Context menu (right-click) bị chặn trong production để ngăn "Inspect Element".
              </Paragraph>
              <Text type="secondary">
                Thử right-click vào trang để kiểm tra
              </Text>
            </div>

            <Divider />

            <div>
              <Title level={5}>5. Violation Management</Title>
              <Paragraph>
                Hệ thống đếm số lần vi phạm và lưu vào sessionStorage.
                Sau 3 lần vi phạm, user sẽ bị logout tự động.
              </Paragraph>
              <Text type="secondary">
                Current violations: {violationCount}
              </Text>
            </div>
          </Space>
        </Card>

        {/* Testing Instructions */}
        <Card title="🧪 Hướng Dẫn Test">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Title level={5}>Development Mode (npm start)</Title>
              <ul>
                <li>✅ Console logs hoạt động bình thường</li>
                <li>✅ F12 mở được DevTools</li>
                <li>✅ Right-click hoạt động</li>
                <li>✅ Không có cảnh báo</li>
              </ul>
            </div>

            <div>
              <Title level={5}>Production Mode (npm run build)</Title>
              <ul>
                <li>❌ Console logs không hiển thị</li>
                <li>❌ F12 bị chặn</li>
                <li>❌ Ctrl+Shift+I/J/C bị chặn</li>
                <li>❌ Right-click bị chặn</li>
                <li>⚠️ Mở DevTools → Cảnh báo xuất hiện</li>
                <li>🚪 Mở 3 lần → Tự động logout</li>
              </ul>
            </div>
          </Space>
        </Card>

        {/* Environment Info */}
        <Card title="ℹ️ Environment Info">
          <Space direction="vertical">
            <Text>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
            </Text>
            <Text>
              <strong>Protection Active:</strong> {isActive ? 'Yes' : 'No'}
            </Text>
            <Text>
              <strong>User Agent:</strong> {navigator.userAgent}
            </Text>
            <Text>
              <strong>Screen Resolution:</strong> {window.screen.width}x{window.screen.height}
            </Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default ProtectionDemo;
