import React from 'react';
import { Modal, Button, Space, Typography, Divider, message } from 'antd';
import { MessageOutlined, PhoneOutlined, WechatOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ContactModal = ({ visible, onClose, product, seller }) => {
  const copyToClipboard = (text, type) => {
    if (!navigator.clipboard) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        message.success(`Đã sao chép ${type} vào clipboard`);
      } catch (err) {
        message.error(`Không thể sao chép ${type}`);
      }
      document.body.removeChild(textArea);
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        message.success(`Đã sao chép ${type} vào clipboard`);
      })
      .catch((err) => {
        console.error('Clipboard copy failed:', err);
        message.error(`Không thể sao chép ${type}. Vui lòng thử lại.`);
      });
  };

  const openZalo = (phone) => {
    const zaloUrl = `https://zalo.me/${phone.replace(/[^0-9]/g, '')}`;
    window.open(zaloUrl, '_blank');
  };

  const openChat = () => {
    // Redirect to chat page with seller ID
    window.location.href = `/messages?userId=${seller?.id}`;
  };

  const callPhone = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  if (!product || !seller) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
            Liên hệ người bán
          </Title>
          <Text type="secondary">{product.name}</Text>
        </div>
      }
      width={400}
      centered
    >
      <div style={{ padding: '16px 0' }}>
        {/* Seller Info */}
        <div style={{ 
          background: '#f6ffed', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
          <Title level={5} style={{ margin: 0 }}>{seller.name || seller.email}</Title>
          <Text type="secondary">Người bán</Text>
        </div>

        {/* Contact Options */}
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Chat Option */}
          <Button
            type="primary"
            size="large"
            icon={<MessageOutlined />}
            onClick={openChat}
            block
            style={{
              background: 'linear-gradient(135deg, #1890ff, #096dd9)',
              border: 'none',
              borderRadius: 8,
              height: 48
            }}
          >
            Nhắn tin trực tiếp
          </Button>

          {/* Phone Options */}
          {seller.phone && (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="large"
                  icon={<PhoneOutlined />}
                  onClick={() => callPhone(seller.phone)}
                  style={{
                    flex: 1,
                    background: '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    height: 48
                  }}
                >
                  Gọi điện
                </Button>
                <Button
                  size="large"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(seller.phone, 'số điện thoại')}
                  style={{
                    borderColor: '#52c41a',
                    color: '#52c41a',
                    borderRadius: 8,
                    height: 48,
                    width: 48
                  }}
                />
              </div>

              {/* Zalo Option */}
              <Button
                size="large"
                icon={<WechatOutlined />}
                onClick={() => openZalo(seller.phone)}
                block
                style={{
                  background: '#0068ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  height: 48
                }}
              >
                Chat qua Zalo
              </Button>
            </>
          )}

          {/* Email Option */}
          {seller.email && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="large"
                onClick={() => window.location.href = `mailto:${seller.email}`}
                style={{
                  flex: 1,
                  borderColor: '#722ed1',
                  color: '#722ed1',
                  borderRadius: 8,
                  height: 48
                }}
              >
                📧 Gửi Email
              </Button>
              <Button
                size="large"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(seller.email, 'email')}
                style={{
                  borderColor: '#722ed1',
                  color: '#722ed1',
                  borderRadius: 8,
                  height: 48,
                  width: 48
                }}
              />
            </div>
          )}
        </Space>

        <Divider />

        {/* Product Quick Info */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Sản phẩm: {product.name} • Giá: {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.price)}/{product.unit}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ContactModal;