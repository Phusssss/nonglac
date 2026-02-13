import React, { useState } from 'react';
import { Modal, Card, Row, Col, Button, Typography, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { MISSIONS_CONSTANTS } from '../constants';

const { Title, Text, Paragraph } = Typography;

/**
 * Modal cho phép user chọn 1 trong 3 danh hiệu chuyên môn
 */
const BadgeSelectionModal = ({ 
  open, 
  onSelect, 
  onCancel,
  loading = false 
}) => {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const professionBadges = [
    { key: 'PRODUCER', badge: MISSIONS_CONSTANTS.BADGES.PRODUCER },
    { key: 'SUPPLIER', badge: MISSIONS_CONSTANTS.BADGES.SUPPLIER },
    { key: 'TRADER', badge: MISSIONS_CONSTANTS.BADGES.TRADER }
  ];

  const handleConfirm = () => {
    if (selectedBadge) {
      onSelect(selectedBadge);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
      closable={false}
      maskClosable={false}
    >
      <div className="text-center mb-6">
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
          🎉
        </div>
        <Title level={3} className="mb-2">
          Chúc mừng! Bạn đã đạt 500 điểm
        </Title>
        <Paragraph className="text-gray-600">
          Hãy chọn 1 danh hiệu chuyên môn phù hợp với bạn nhất.
          <br />
          <Text type="warning" strong>
            Lưu ý: Bạn chỉ được chọn 1 lần duy nhất!
          </Text>
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        {professionBadges.map(({ key, badge }) => (
          <Col xs={24} sm={8} key={key}>
            <Card
              hoverable
              className={`text-center cursor-pointer transition-all ${
                selectedBadge === key 
                  ? 'border-2 border-green-500 shadow-lg' 
                  : 'border border-gray-200'
              }`}
              onClick={() => setSelectedBadge(key)}
              style={{
                background: selectedBadge === key ? '#f6ffed' : 'white'
              }}
            >
              {selectedBadge === key && (
                <div className="absolute top-2 right-2">
                  <CheckCircleOutlined 
                    style={{ fontSize: '24px', color: '#52c41a' }} 
                  />
                </div>
              )}
              
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {badge.icon}
              </div>
              
              <Title level={5} className="mb-2">
                {badge.label}
              </Title>
              
              <Text type="secondary" className="text-sm">
                {badge.description}
              </Text>

              <div className="mt-4">
                <Text className="text-xs text-gray-500">
                  Quyền lợi:
                </Text>
                {badge.benefits.map((benefit, idx) => (
                  <div key={idx} className="text-xs text-gray-600 mt-1">
                    • {benefit}
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Space className="w-full justify-center">
        <Button
          type="primary"
          size="large"
          onClick={handleConfirm}
          disabled={!selectedBadge}
          loading={loading}
          style={{ minWidth: '200px' }}
        >
          Xác nhận lựa chọn
        </Button>
      </Space>

      <div className="text-center mt-4">
        <Text type="secondary" className="text-xs">
          Bạn có thể thay đổi danh hiệu hiển thị trong trang cá nhân sau này
        </Text>
      </div>
    </Modal>
  );
};

export default BadgeSelectionModal;
