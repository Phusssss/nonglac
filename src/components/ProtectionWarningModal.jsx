import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const ProtectionWarningModal = ({ visible, onClose, config, violationCount }) => {
  const messages = config.customMessages || {};
  
  const defaultTitle = '⚠️ CẢNH BÁO BẢO MẬT';
  const defaultContent = `Hệ thống đã phát hiện hành vi cố gắng truy cập mã nguồn. Vui lòng đóng Developer Tools để tiếp tục sử dụng ứng dụng.

Số lần vi phạm: ${violationCount}/3

Nếu tiếp tục vi phạm, tài khoản của bạn sẽ bị đăng xuất tự động.`;

  const copyrightText = `© ${new Date().getFullYear()} NôngLạc Social - Bản quyền thuộc về NôngLạc
Mọi hành vi sao chép, phân tích mã nguồn đều bị nghiêm cấm.
Hệ thống đã ghi nhận và báo cáo hành vi này.`;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={600}
      maskStyle={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }}
      bodyStyle={{ 
        padding: '48px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 1.5
            }}
          >
            <ShieldAlert size={80} color="#fff" strokeWidth={2.5} />
          </motion.div>

          <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>
            {messages.warningTitle || defaultTitle}
          </Title>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '24px', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <Text style={{ 
              fontSize: '16px', 
              color: '#262626',
              whiteSpace: 'pre-line',
              display: 'block',
              lineHeight: '1.8'
            }}>
              {messages.warningContent || defaultContent}
            </Text>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Text style={{ 
              fontSize: '13px', 
              color: '#fff',
              whiteSpace: 'pre-line',
              display: 'block',
              lineHeight: '1.6',
              opacity: 0.9
            }}>
              {copyrightText}
            </Text>
          </div>

          {violationCount >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#ff4d4f',
                padding: '16px',
                borderRadius: '6px'
              }}
            >
              <Text style={{ 
                fontSize: '15px', 
                color: '#fff',
                fontWeight: 'bold'
              }}>
                🚨 CẢNH BÁO: Bạn sẽ bị đăng xuất trong 3 giây...
              </Text>
            </motion.div>
          )}
        </Space>
      </motion.div>
    </Modal>
  );
};

export default ProtectionWarningModal;
