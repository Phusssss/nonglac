import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Space, Card } from 'antd';
import { 
  DownloadOutlined, 
  MobileOutlined, 
  DesktopOutlined,
  CheckCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      setShowInstallModal(true);
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`PWA: User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA: Error during installation:', error);
    }
  };

  // Don't show button if already installed
  if (isInstalled) {
    return null;
  }

  const InstallModal = () => (
    <Modal
      open={showInstallModal}
      onCancel={() => setShowInstallModal(false)}
      footer={null}
      centered
      width={500}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
        <Title level={3} style={{ marginBottom: '16px' }}>
          Tải NôngLạc về máy
        </Title>
        <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
          Cài đặt ứng dụng NôngLạc để trải nghiệm tốt hơn:
        </Paragraph>
        
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small" style={{ textAlign: 'left' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text>Truy cập nhanh từ màn hình chính</Text>
            </Space>
          </Card>
          <Card size="small" style={{ textAlign: 'left' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text>Hoạt động offline khi mất mạng</Text>
            </Space>
          </Card>
          <Card size="small" style={{ textAlign: 'left' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text>Nhận thông báo realtime</Text>
            </Space>
          </Card>
          <Card size="small" style={{ textAlign: 'left' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text>Tiết kiệm dung lượng thiết bị</Text>
            </Space>
          </Card>
        </Space>

        <div style={{ marginTop: '24px' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Trình duyệt của bạn chưa hỗ trợ cài đặt tự động.
            <br />
            Hãy thử lại sau hoặc sử dụng Chrome/Edge.
          </Text>
        </div>
      </div>
    </Modal>
  );

  const IOSInstructionsModal = () => (
    <Modal
      open={showIOSInstructions}
      onCancel={() => setShowIOSInstructions(false)}
      footer={null}
      centered
      width={500}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍎</div>
        <Title level={3} style={{ marginBottom: '16px' }}>
          Cài đặt trên iPhone/iPad
        </Title>
        
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card size="small">
              <Space>
                <span style={{ 
                  backgroundColor: '#007AFF', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '24px', 
                  height: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>1</span>
                <Text>Nhấn nút <strong>Chia sẻ</strong> (📤) ở thanh công cụ Safari</Text>
              </Space>
            </Card>
            
            <Card size="small">
              <Space>
                <span style={{ 
                  backgroundColor: '#007AFF', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '24px', 
                  height: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>2</span>
                <Text>Chọn <strong>"Thêm vào Màn hình chính"</strong></Text>
              </Space>
            </Card>
            
            <Card size="small">
              <Space>
                <span style={{ 
                  backgroundColor: '#007AFF', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '24px', 
                  height: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>3</span>
                <Text>Nhấn <strong>"Thêm"</strong> để hoàn tất</Text>
              </Space>
            </Card>
          </Space>
        </div>

        <Text type="secondary" style={{ fontSize: '14px' }}>
          Sau khi cài đặt, bạn có thể mở NôngLạc từ màn hình chính như một ứng dụng thật!
        </Text>
      </div>
    </Modal>
  );

  return (
    <>
      <Button
        type="primary"
        onClick={handleInstallClick}
        size="small"
        style={{
          backgroundColor: '#52c41a',
          borderColor: '#52c41a',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          minWidth: '32px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className="pwa-install-btn"
      >
        <DownloadOutlined style={{ fontSize: '14px' }} />
      </Button>

      <InstallModal />
      <IOSInstructionsModal />
    </>
  );
};

export default PWAInstallButton;