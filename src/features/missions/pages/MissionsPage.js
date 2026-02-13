import React, { useState } from 'react';
import { Row, Col, Tabs, Typography, notification, Card } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { useMissions } from '../hooks';
import { MISSIONS_CONSTANTS } from '../constants';
import { missionsUtils } from '../utils';
import { missionsService } from '../services';
import {
  MissionCard,
  BadgeCard,
  UltimateRewardCard,
  BadgeSelectionModal
} from '../components';
import EnhancedLoginModal from '../../../components/enhanced/EnhancedLoginModal';

const { Title, Text } = Typography;

/**
 * Trang chính của missions feature
 */
const MissionsPage = () => {
  const { user } = useAuth();
  const { requireAuth, showLoginModal, setShowLoginModal } = useAuthGuard();
  const {
    missionsData,
    executeMission,
    claimMissionReward
  } = useMissions();

  const [activeTab, setActiveTab] = useState('missions');
  const [actionLoading, setActionLoading] = useState(false);
  const [showBadgeSelection, setShowBadgeSelection] = useState(false);

  // Kiểm tra xem có cần hiển thị modal chọn badge không
  React.useEffect(() => {
    const checkAndCleanupBadges = async () => {
      if (!user) return;
      
      // Kiểm tra dữ liệu hợp lệ
      if (!missionsData.unlockedBadges || !Array.isArray(missionsData.unlockedBadges)) {
        return;
      }

      // Cleanup dữ liệu cũ nếu có nhiều badge profession
      const professionBadges = ['PRODUCER', 'SUPPLIER', 'TRADER'];
      const userProfessionBadges = missionsData.unlockedBadges.filter(
        badge => professionBadges.includes(badge)
      );

      // Nếu có nhiều hơn 1 badge profession, cleanup
      if (userProfessionBadges.length > 1) {
        const result = await missionsService.cleanupProfessionBadges(user.uid);
        if (result.success && result.cleaned) {
          notification.info({
            message: 'Đã cập nhật danh hiệu',
            description: `Hệ thống đã giữ lại danh hiệu: ${MISSIONS_CONSTANTS.BADGES[result.keptBadge]?.label}`,
            duration: 5
          });
          // Reload để cập nhật UI
          setTimeout(() => window.location.reload(), 1000);
          return;
        }
      }

      // Kiểm tra có cần hiển thị modal chọn badge không
      if (missionsData.score >= 500) {
        const hasSelectedProfession = professionBadges.some(badge => 
          missionsData.unlockedBadges.includes(badge)
        );
        
        if (!hasSelectedProfession) {
          setShowBadgeSelection(true);
        }
      }
    };

    checkAndCleanupBadges();
  }, [user, missionsData.score, missionsData.unlockedBadges]);

  /**
   * Xử lý chọn badge chuyên môn
   */
  const handleSelectBadge = async (badgeId) => {
    if (!user) return;
    
    setActionLoading(true);
    const result = await missionsService.selectProfessionBadge(user.uid, badgeId);
    setActionLoading(false);
    
    if (result.success) {
      setShowBadgeSelection(false);
      notification.success({
        message: 'Chọn danh hiệu thành công!',
        description: `Bạn đã chọn danh hiệu: ${result.badge.label}`,
        duration: 5
      });
      
      // Reload missions data
      window.location.reload();
    } else {
      notification.error({
        message: 'Lỗi',
        description: result.error || 'Không thể chọn danh hiệu'
      });
    }
  };

  /**
   * Xử lý thực hiện nhiệm vụ
   */
  const handleMissionAction = async (mission, additionalData = null) => {
    return requireAuth(async () => {
      setActionLoading(true);
      const result = await executeMission(mission, additionalData);
      setActionLoading(false);
      
      if (result.success) {
        if (result.waitingVerification) {
          notification.info({
            message: 'Chờ xác thực',
            description: 'Thông tin của bạn đang chờ admin xác thực. Bạn sẽ nhận được thông báo khi hoàn tất.'
          });
        } else if (result.completed) {
          notification.success({
            message: 'Thành công!',
            description: 'Nhiệm vụ đã hoàn thành! Hãy nhận thưởng.'
          });
        } else {
          notification.success({
            message: 'Thành công!',
            description: 'Tiến độ nhiệm vụ đã được cập nhật.'
          });
        }
      } else {
        notification.error({
          message: 'Lỗi',
          description: result.error || 'Không thể cập nhật nhiệm vụ'
        });
      }
    }, {
      message: 'Đăng nhập để thực hiện nhiệm vụ',
      feature: 'thực hiện nhiệm vụ'
    });
  };

  /**
   * Xử lý nhận thưởng nhiệm vụ
   */
  const handleClaimReward = async (missionId) => {
    return requireAuth(async () => {
      setActionLoading(true);
      const result = await claimMissionReward(missionId);
      setActionLoading(false);
      
      if (result.success) {
        notification.success({
          message: 'Nhận thưởng thành công!',
          description: `Bạn đã nhận được ${missionsUtils.formatScore(result.reward)} điểm uy tín!`
        });
        
        // Hiển thị badges mới nếu có
        if (result.newBadges && result.newBadges.length > 0) {
          result.newBadges.forEach(badgeId => {
            const badge = missionsUtils.getBadgeInfo(badgeId);
            if (badge) {
              notification.success({
                message: 'Mở khóa danh hiệu mới!',
                description: `Bạn đã đạt được danh hiệu: ${badge.label}`,
                duration: 5
              });
            }
          });
        }
      } else {
        notification.error({
          message: 'Lỗi',
          description: result.error || 'Không thể nhận thưởng'
        });
      }
    }, {
      message: 'Đăng nhập để nhận thưởng',
      feature: 'nhận thưởng nhiệm vụ'
    });
  };

  /**
   * Xử lý nhận ultimate reward
   */
  const handleClaimUltimateReward = async () => {
    return requireAuth(async () => {
      notification.success({
        message: 'Chúc mừng!',
        description: 'Bạn đã đạt được danh hiệu Nông dân xuất sắc!'
      });
    }, {
      message: 'Đăng nhập để nhận phần thưởng đặc biệt',
      feature: 'nhận ultimate reward'
    });
  };

  // Sắp xếp missions theo độ ưu tiên
  const sortedMissions = missionsUtils.sortMissionsByPriority(missionsData.missions);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Title level={2} className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            <TrophyOutlined style={{ color: MISSIONS_CONSTANTS.COLORS.SECONDARY }} /> 
            {MISSIONS_CONSTANTS.MESSAGES.LABELS.MISSIONS_TITLE}
          </Title>
          <Text className="text-gray-600">
            {MISSIONS_CONSTANTS.MESSAGES.LABELS.AGRI_TRUST_SCORE} - Điểm tín nhiệm nông nghiệp
          </Text>
          <div className="mt-2">
            <Text className="text-sm text-gray-500">
              Tính toán dựa trên 3 lớp: Định danh (20%) + Hành vi (40%) + Uy tín (40%)
            </Text>
          </div>
        </div>

        {/* AgriTrust Level Card */}
        <Card className="mb-6" style={{ 
          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
          border: 'none',
          color: 'white'
        }}>
          <div className="text-center">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {missionsUtils.getAgriTrustLevel(missionsData.score).icon}
            </div>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              {missionsUtils.getAgriTrustLevel(missionsData.score).name}
            </Title>
            <Title level={1} style={{ color: 'white', margin: '8px 0' }}>
              {missionsUtils.formatScore(missionsData.score)} điểm
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              AgriTrust-Score của bạn
            </Text>
          </div>
        </Card>

        {/* Ultimate Reward Card */}
        <UltimateRewardCard
          currentScore={missionsData.score}
          onClaimUltimateReward={handleClaimUltimateReward}
          loading={actionLoading}
        />

        {/* Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          className="bg-white rounded-lg p-4"
          items={[
            {
              key: 'missions',
              label: 'Nhiệm vụ theo lớp',
              children: (
                <div>
                  {/* Lớp 1 */}
                  <div className="mb-6">
                    <Title level={4} className="mb-4">
                      {MISSIONS_CONSTANTS.MESSAGES.LABELS.LAYER_1}
                    </Title>
                    <Row gutter={[16, 16]} justify="center">
                      {sortedMissions.filter(m => m.layer === 1).map(mission => (
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} key={mission.id}>
                          <MissionCard
                            mission={mission}
                            onExecute={handleMissionAction}
                            onClaimReward={handleClaimReward}
                            loading={actionLoading}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                  
                  {/* Lớp 2 */}
                  <div className="mb-6">
                    <Title level={4} className="mb-4">
                      {MISSIONS_CONSTANTS.MESSAGES.LABELS.LAYER_2}
                    </Title>
                    <Row gutter={[16, 16]} justify="center">
                      {sortedMissions.filter(m => m.layer === 2).map(mission => (
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} key={mission.id}>
                          <MissionCard
                            mission={mission}
                            onExecute={handleMissionAction}
                            onClaimReward={handleClaimReward}
                            loading={actionLoading}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                  
                  {/* Lớp 3 */}
                  <div className="mb-6">
                    <Title level={4} className="mb-4">
                      {MISSIONS_CONSTANTS.MESSAGES.LABELS.LAYER_3}
                    </Title>
                    <Row gutter={[16, 16]} justify="center">
                      {sortedMissions.filter(m => m.layer === 3).map(mission => (
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} key={mission.id}>
                          <MissionCard
                            mission={mission}
                            onExecute={handleMissionAction}
                            onClaimReward={handleClaimReward}
                            loading={actionLoading}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                  
                  {/* Lớp 4 - Tương lai */}
                  <div>
                    <Title level={4} className="mb-4">
                      Lớp 4: Tương lai (2027) 
                      <span className="text-sm text-gray-500 ml-2">
                        {MISSIONS_CONSTANTS.MESSAGES.LABELS.COMING_SOON}
                      </span>
                    </Title>
                    <Row gutter={[16, 16]} justify="center">
                      {sortedMissions.filter(m => m.layer === 4).map(mission => (
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} key={mission.id}>
                          <MissionCard
                            mission={mission}
                            onExecute={handleMissionAction}
                            onClaimReward={handleClaimReward}
                            loading={actionLoading}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>
              )
            },
            {
              key: 'badges',
              label: MISSIONS_CONSTANTS.MESSAGES.LABELS.BADGES_TITLE,
              children: (
                <Row gutter={[16, 16]} justify="center">
                  {Object.keys(MISSIONS_CONSTANTS.BADGES).map(badgeId => (
                    <Col xs={12} sm={8} md={6} lg={6} xl={4} key={badgeId}>
                      <BadgeCard
                        badgeId={badgeId}
                        isUnlocked={missionsData.unlockedBadges.includes(badgeId)}
                        currentScore={missionsData.score}
                      />
                    </Col>
                  ))}
                </Row>
              )
            }
          ]}
        />


        
        {/* Badge Selection Modal */}
        <BadgeSelectionModal
          open={showBadgeSelection}
          onSelect={handleSelectBadge}
          onCancel={() => {}} // Không cho phép đóng modal
          loading={actionLoading}
        />

        {/* Enhanced Login Modal */}
        <EnhancedLoginModal
          open={showLoginModal}
          onCancel={() => setShowLoginModal(false)}
          title="Đăng nhập để xem nhiệm vụ"
          message="Đăng nhập để xem và thực hiện các nhiệm vụ nâng cao uy tín"
          feature="sử dụng hệ thống nhiệm vụ"
        />
      </div>
    </div>
  );
};

export default MissionsPage;