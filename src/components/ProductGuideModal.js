import React from 'react';
import { Modal, Steps, Button, Typography, Space } from 'antd';
import { ShopOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

/**
 * Modal hướng dẫn đăng sản phẩm
 */
const ProductGuideModal = ({ open, onClose }) => {
  const steps = [
    {
      title: 'Bước 1: Vào trang Chợ',
      description: 'Bấm vào icon Chợ ở thanh điều hướng',
      icon: <ShopOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
    },
    {
      title: 'Bước 2: Đăng sản phẩm',
      description: 'Bấm vào nút "Đăng sản phẩm" để tạo sản phẩm mới',
      icon: <PlusOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
    }
  ];

  const handleGoToMarketplace = () => {
    onClose();
    window.location.href = '/marketplace';
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            📦 Hướng dẫn đăng sản phẩm đầu tiên
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Để sau
        </Button>,
        <Button key="go" type="primary" onClick={handleGoToMarketplace}>
          Đi đến Chợ ngay
        </Button>
      ]}
      width={500}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        <Steps direction="vertical" size="small">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
              status="process"
            />
          ))}
        </Steps>
        
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '6px'
        }}>
          <Text strong style={{ color: '#52c41a' }}>
            💡 Mẹo: 
          </Text>
          <Text>
            Sau khi đăng sản phẩm thành công, nhiệm vụ sẽ tự động hoàn thành và bạn nhận được 200 điểm!
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ProductGuideModal;