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
    <div className="mb-8 bg-gradient-to-br from-amber-50 to-white rounded-3xl border border-amber-200/60 shadow-[0_4px_20px_-4px_rgba(251,191,36,0.15)] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      
      <div className="p-4 md:p-6 relative z-10">
        <Row align="middle" gutter={[24, 24]}>
          {/* Ultimate Reward Icon */}
          <Col xs={24} sm={6} md={5} className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-amber-200 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <img
                src={nutbacImage}
                alt="Nút Bạc NôngLạc"
                className="relative w-28 h-28 md:w-32 md:h-32 object-contain rounded-full border-[3px] border-amber-400 bg-white/90 shadow-md p-3 transition-transform group-hover:scale-105"
              />
            </div>
          </Col>

          {/* Ultimate Reward Info */}
          <Col xs={24} sm={18} md={13}>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {silverButton.title}
            </h3>
            <p className="text-sm md:text-base text-slate-600 mb-3">
              {silverButton.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-semibold text-slate-700">
                  Tiến độ: {missionsUtils.formatScore(currentScore)} / {missionsUtils.formatScore(silverButton.threshold)}
                </span>
                {!canClaim && (
                  <span className="text-xs text-amber-600 font-medium">
                    Còn {missionsUtils.formatScore(remaining)} điểm
                  </span>
                )}
              </div>
              <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Benefits List */}
            <div className="bg-white/60 p-3 rounded-xl border border-amber-100/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 block">
                Đặc quyền 1000 điểm:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 m-0 p-0 list-none text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Nút Bạc vật lý</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Ưu tiên ghép xe</li>
                <li className="flex items-center gap-2 sm:col-span-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Mua vật tư trả chậm (BNPL)</li>
              </ul>
            </div>
          </Col>

          {/* Claim Button */}
          <Col xs={24} md={6} className="flex flex-col items-center justify-center">
            <Button
              type="primary"
              size={window.innerWidth < 768 ? 'middle' : 'large'}
              disabled={!canClaim}
              loading={loading}
              onClick={onClaimUltimateReward}
              className={`w-full max-w-[200px] rounded-xl font-semibold border-none h-11 shadow-sm transition-all ${
                canClaim 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20 text-white hover:-translate-y-0.5' 
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {canClaim ? 'Nhận Nút Bạc!' : 'Chưa đủ điều kiện'}
            </Button>
            {canClaim && (
              <span className="mt-2 text-[11px] font-bold text-amber-600 animate-pulse uppercase tracking-wide">
                Sẵn sàng nhận thưởng!
              </span>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default UltimateRewardCard;
