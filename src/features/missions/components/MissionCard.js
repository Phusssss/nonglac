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
      <div 
        onClick={canExecute || canClaim ? handleButtonClick : undefined}
        className={`relative h-full bg-white rounded-2xl border transition-all duration-300 flex flex-col p-5 overflow-hidden group ${
          canExecute || canClaim ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)]' : ''
        } ${
          mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED 
            ? 'opacity-60 grayscale-[20%]' 
            : canClaim
            ? 'border-[#4CAF50]/50 shadow-[0_4px_16px_-4px_rgba(76,175,80,0.2)] bg-gradient-to-br from-green-50/50 to-white'
            : 'border-slate-100 shadow-sm'
        }`}
      >
        {/* Claim Ready Glow */}
        {canClaim && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4CAF50]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        )}

        {/* Mission Icon */}
        <div className="flex justify-between items-start mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${canClaim ? 'bg-[#4CAF50]/10' : 'bg-slate-50 border border-slate-100'}`}>
            {missionsUtils.getMissionIcon(mission.icon)}
          </div>
          
          {/* Reward Badge */}
          <div className="flex items-center gap-1 bg-green-50 text-[#4CAF50] px-2.5 py-1 rounded-full font-bold text-[13px] border border-[#4CAF50]/20 shadow-sm">
            <span className="text">🔥</span> +{missionsUtils.formatScore(mission.reward)}
          </div>
        </div>
        
        {/* Mission Info */}
        <div className="flex-1">
          <h4 className={`text-[17px] font-bold mb-1.5 leading-tight ${canClaim ? 'text-slate-800' : 'text-slate-700'}`}>
            {mission.title}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed mb-4 min-h-[44px]">
            {mission.description}
          </p>
        </div>

        {/* Status Indicator Top Right */}
        {canClaim && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex w-2.5 h-2.5 bg-[#4CAF50] rounded-full animate-pulse shadow-[0_0_8px_rgba(76,175,80,0.8)]"></span>
          </div>
        )}

        <div className="mt-auto">
          {/* Progress Bar */}
          {mission.status !== MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED && 
           mission.status !== MISSIONS_CONSTANTS.MISSION_STATUS.LOCKED && (
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[13px] font-semibold text-slate-600">Tiến độ</span>
                <span className="text-[13px] font-bold text-slate-800 bg-slate-100 px-2 rounded">
                  {mission.currentProgress} <span className="text-slate-400 font-medium">/ {mission.maxProgress}</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    canClaim ? 'bg-[#4CAF50]' : 'bg-slate-300'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!mission.noButton && (
            <Button 
              {...getButtonProps()} 
              className={`w-full rounded-xl h-10 font-semibold border-none shadow-sm transition-all ${
                mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED
                  ? 'bg-[#4CAF50] text-white hover:bg-[#388E3C] hover:shadow-[#4CAF50]/30 hover:-translate-y-0.5'
                  : mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED || mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.LOCKED
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-green-50 text-[#388E3C] hover:bg-[#4CAF50] hover:text-white'
              }`}
            >
              {getButtonText()}
            </Button>
          )}
          
          {/* Auto update info */}
          {mission.noButton && (
            <div className="w-full text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5">
                <span className="animate-spin-slow">🔄</span> Tự động cập nhật
              </span>
            </div>
          )}
        </div>
      </div>

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