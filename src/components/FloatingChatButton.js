import React, { useState, useEffect } from 'react';
import { Button, Badge, Dropdown, Space, Typography } from 'antd';
import { MessageOutlined, RobotOutlined, MedicineBoxOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Text } = Typography;

const FloatingChatButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Simulate new messages (replace with real logic later)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setHasNewMessages(true);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChatClick = () => {
    if (user) {
      navigate('/messages');
      setHasNewMessages(false);
    } else {
      navigate('/phone-login');
    }
  };

  const handleQuickAction = (action) => {
    setShowQuickMenu(false);
    
    switch (action) {
      case 'chat':
        navigate('/chat');
        break;
      case 'ai':
        window.dispatchEvent(new CustomEvent('openChatBot'));
        break;
      case 'doctor':
        navigate('/plant-doctor');
        break;
      default:
        break;
    }
  };

  const quickMenuItems = [
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 500 }}>Mở Chat</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Trò chuyện với nông dân khác
          </Text>
        </div>
      ),
      onClick: () => handleQuickAction('chat')
    },
    {
      key: 'ai',
      icon: <RobotOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 500 }}>AI Tư vấn</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hỏi đáp với AI về nông nghiệp
          </Text>
        </div>
      ),
      onClick: () => handleQuickAction('ai')
    },
    {
      key: 'doctor',
      icon: <MedicineBoxOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 500 }}>Bác sĩ cây trồng</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Chẩn đoán bệnh cây trồng
          </Text>
        </div>
      ),
      onClick: () => handleQuickAction('doctor')
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            zIndex: 1000
          }}
          className="md:bottom-6"
        >
          <Space direction="vertical" align="end" size={8}>
            {/* Quick Menu Button (Desktop only) */}
            <div className="hidden md:block">
              <Dropdown
                menu={{ items: quickMenuItems }}
                placement="topRight"
                trigger={['click']}
                open={showQuickMenu}
                onOpenChange={setShowQuickMenu}
              >
                <Button
                  size="small"
                  type="default"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #d9f7be',
                    color: '#52c41a'
                  }}
                >
                  Chat nhanh
                </Button>
              </Dropdown>
            </div>

            {/* Main Chat Button */}
            <Badge dot={hasNewMessages} offset={[-8, 8]}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<MessageOutlined style={{ fontSize: 24 }} />}
                onClick={handleChatClick}
                style={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 12px 32px rgba(82, 196, 26, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 8px 24px rgba(82, 196, 26, 0.3)';
                }}
              />
            </Badge>
          </Space>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingChatButton;