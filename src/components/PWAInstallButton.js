import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Space, Card } from 'antd';
import { 
  DownloadOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if it's iOS (real device, not emulation)
    const isIOSDevice = () => {
      const userAgent = navigator.userAgent;
      const isIOSUA = /iPad|iPhone|iPod/.test(userAgent);
      const isRealIOS = isIOSUA && typeof navigator.standalone !== 'undefined';
      return isRealIOS;
    };
    
    setIsIOS(isIOSDevice());

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
      setCanInstall(false);
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
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`PWA: User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('PWA: Error during installation:', error);
    }
  };

  // Don't show button if already installed or can't install
  if (isInstalled || (!canInstall && !isIOS)) {
    return null;
  }

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
        title="Cài đặt ứng dụng"
      >
        <DownloadOutlined style={{ fontSize: '14px' }} />
      </Button>

      <IOSInstructionsModal />
    </>
  );
};

export default PWAInstallButton;
