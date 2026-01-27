import React from 'react';
import { Card, Row, Col, Progress, Button, Typography } from 'antd';
import { MISSIONS_CONSTANTS } from '../constants';
import { missionsUtils } from '../utils';
import nutbacImage from '../../../assets/images/nutbac.png';

const { Title, Text } = Typography;

/**
 * Component hiển thị ultimate reward
 */
const UltimateRewardCard = ({ 
  currentScore, 
  onClaimUltimateReward,
  loading = false 
}) => {
  const { PHYSICAL_REWARDS } = MISSIONS_CONSTANTS;
  const silverButton = PHYSICAL_REWARDS.SILVER_BUTTON;
  const progressPercent = Math.min(100, (currentScore / silverButton.threshold) * 100);
  const canClaim = currentScore >= silverButton.threshold;
  const remaining = Math.max(0, silverButton.threshold - currentScore);

  return (
    <Card 
      className="mb-6" 
      style={{ 
        background: MISSIONS_CONSTANTS.COLORS.GRADIENT_REWARD, 
        border: `2px solid ${MISSIONS_CONSTANTS.COLORS.SECONDARY}` 
      }}
    >
      <Row align="middle" gutter={[16, 16]}>
        {/* Ultimate Reward Icon */}
        <Col xs={24} sm={4} className="text-center">
          <img 
            src={nutbacImage} 
            alt="Nút Bạc NôngLạc" 
            style={{ 
              width: window.innerWidth < 768 ? '120px' : '180px',
              height: window.innerWidth < 768 ? '120px' : '180px',
              objectFit: 'contain',
              borderRadius: '50%',
              border: '4px solid #ffd700',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
        </Col>
        
        {/* Ultimate Reward Info */}
        <Col xs={24} sm={14}>
          <Title level={window.innerWidth < 768 ? 5 : 4} style={{ margin: 0 }}>
            {silverButton.title}
          </Title>
          <Text className="text-sm md:text-base">
            {silverButton.description}
          </Text>
          
          {/* Progress */}
          <div style={{ marginTop: '10px' }}>
            <Text strong className="text-xs md:text-sm">
              Tiến độ: {missionsUtils.formatScore(currentScore)} / {missionsUtils.formatScore(silverButton.threshold)}
            </Text>
            <Progress 
              percent={progressPercent} 
              strokeColor={MISSIONS_CONSTANTS.COLORS.SECONDARY}
              trailColor="#f0f0f0"
            />
            {!canClaim && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Còn {missionsUtils.formatScore(remaining)} điểm nữa
              </Text>
            )}
          </div>

          {/* Benefits List */}
          <div className="mt-3">
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
              Quyền lợi khi đạt 1000 điểm:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
              <li style={{ marginBottom: '2px' }}>
                <Text style={{ fontSize: '11px' }}>Nhận Nút Bạc vật lý gửi về địa chỉ</Text>
              </li>
              <li style={{ marginBottom: '2px' }}>
                <Text style={{ fontSize: '11px' }}>Ưu tiên ghép xe logistics</Text>
              </li>
              <li style={{ marginBottom: '2px' }}>
                <Text style={{ fontSize: '11px' }}>Mua vật tư trả chậm (BNPL)</Text>
              </li>
            </ul>
          </div>
        </Col>
        
        {/* Claim Button */}
        <Col xs={24} sm={6} className="text-center">
          <Button 
            type="primary" 
            size={window.innerWidth < 768 ? 'middle' : 'large'} 
            disabled={!canClaim}
            loading={loading}
            onClick={onClaimUltimateReward}
            className="w-full sm:w-auto"
            style={{
              backgroundColor: canClaim ? MISSIONS_CONSTANTS.COLORS.SECONDARY : undefined,
              borderColor: canClaim ? MISSIONS_CONSTANTS.COLORS.SECONDARY : undefined
            }}
          >
            {canClaim ? 'Nhận ngay!' : 'Chưa đủ điều kiện'}
          </Button>
          
          {canClaim && (
            <div className="mt-2">
              <Text style={{ fontSize: '10px', color: '#52c41a' }}>
                ✨ Sẵn sàng nhận thưởng!
              </Text>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default UltimateRewardCard;