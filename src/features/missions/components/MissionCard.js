import React, { useState } from 'react';
import { Card, Button, Progress, Badge, Typography } from 'antd';
import { MISSIONS_CONSTANTS } from '../constants';
import { missionsUtils } from '../utils';
import ProfileInfoModal from '../../../components/ProfileInfoModal';
import ProductGuideModal from '../../../components/ProductGuideModal';

const { Title, Text } = Typography;

/**
 * Component hiển thị thông tin một nhiệm vụ
 */
const MissionCard = ({ 
  mission, 
  onExecute, 
  onClaimReward, 
  loading = false 
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  
  const progressPercent = missionsUtils.getProgressPercent(mission);
  const canExecute = missionsUtils.canExecuteMission(mission);
  const canClaim = missionsUtils.canClaimReward(mission);
  const statusColor = missionsUtils.getStatusColor(mission.status);
  const statusText = missionsUtils.getStatusText(mission.status);

  const handleButtonClick = () => {
    if (canClaim) {
      onClaimReward(mission.id);
    } else if (canExecute) {
      // Nếu là nhiệm vụ nhập địa chỉ canh tác, mở modal
      if (mission.id === 'add_farm_address') {
        setModalConfig(MISSIONS_CONSTANTS.MODAL_CONFIGS.FARM_ADDRESS);
        setModalOpen(true);
      } else if (mission.id === 'add_farm_area') {
        setModalConfig(MISSIONS_CONSTANTS.MODAL_CONFIGS.FARM_AREA);
        setModalOpen(true);
      } else if (mission.id === 'first_product_post') {
        // Mở modal hướng dẫn
        setGuideModalOpen(true);
      } else {
        onExecute(mission);
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      // Gọi dữ liệu lên service và cập nhật mission
      await onExecute(mission, formData);
      setModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu thông tin:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const getButtonProps = () => {
    const baseProps = {
      className: 'w-full',
      size: window.innerWidth < 768 ? 'small' : 'middle',
      loading,
      onClick: handleButtonClick
    };

    if (mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED) {
      return { ...baseProps, disabled: true };
    }
    
    if (mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED) {
      return { ...baseProps, type: 'primary' };
    }
    
    if (mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.LOCKED) {
      return { ...baseProps, disabled: true };
    }
    
    if (mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.WAITING_VERIFICATION) {
      return { ...baseProps, disabled: true, type: 'default' };
    }
    
    if (mission.autoUpdate && mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.PENDING) {
      return { ...baseProps, disabled: true, type: 'default' };
    }
    
    return { ...baseProps, type: 'default' };
  };

  const getButtonText = () => {
    if (mission.autoUpdate && mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.PENDING) {
      return 'Tự động cập nhật';
    }
    if (mission.actionText && mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.PENDING) {
      return mission.actionText;
    }
    return statusText;
  };

  return (
    <>
      <Card 
        hoverable={canExecute || canClaim}
        className="h-full transition-all duration-200 hover:shadow-lg" 
        style={{ 
          opacity: mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED ? 0.6 : 1,
          borderColor: canClaim ? MISSIONS_CONSTANTS.COLORS.SUCCESS : undefined
        }}
      >
        {/* Mission Icon */}
        <div className="text-center mb-4">
          <div style={{ fontSize: window.innerWidth < 768 ? '36px' : '48px' }}>
            {missionsUtils.getMissionIcon(mission.icon)}
          </div>
        </div>
        
        {/* Mission Info */}
        <Title level={5} className="text-base md:text-lg mb-2">
          {mission.title}
        </Title>
        <Text type="secondary" className="text-sm">
          {mission.description}
        </Text>
        
        {/* Reward Badge */}
        <div className="my-4">
          <Badge 
            count={`+${missionsUtils.formatScore(mission.reward)}`} 
            style={{ backgroundColor: MISSIONS_CONSTANTS.COLORS.SUCCESS }} 
          />
        </div>

        {/* Progress Bar */}
        {mission.status !== MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED && 
         mission.status !== MISSIONS_CONSTANTS.MISSION_STATUS.LOCKED && (
          <div className="mb-4">
            <Text strong className="text-sm">
              Tiến độ: {mission.currentProgress}/{mission.maxProgress}
            </Text>
            <Progress 
              percent={progressPercent} 
              size="small" 
              strokeColor={statusColor}
              showInfo={false}
            />
          </div>
        )}

        {/* Action Button */}
        {!mission.noButton && (
          <div className="w-full">
            <Button {...getButtonProps()}>
              {getButtonText()}
            </Button>
          </div>
        )}
        
        {/* Thông tin tự động cho mission không có button */}
        {mission.noButton && (
          <div className="w-full text-center">
            <Text type="secondary" className="text-xs">
              🔄 Tự động cập nhật
            </Text>
          </div>
        )}

        {/* Status Indicator */}
        {canClaim && (
          <div className="absolute top-2 right-2">
            <Badge 
              status="success" 
              text="Sẵn sàng nhận thưởng" 
              className="text-xs"
            />
          </div>
        )}
      </Card>

      {/* Modal bổ sung thông tin */}
      {modalConfig && (
        <ProfileInfoModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setModalConfig(null);
          }}
          onSubmit={handleModalSubmit}
          title={modalConfig.title}
          fields={modalConfig.fields}
          loading={modalLoading}
        />
      )}
      
      {/* Modal hướng dẫn đăng sản phẩm */}
      <ProductGuideModal
        open={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </>
  );
};

export default MissionCard;