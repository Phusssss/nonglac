import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Badge, Typography, Row, Col, Tabs, notification } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import missionService from '../../services/missionService';
import { BADGES, ULTIMATE_REWARD } from '../../data/missions';
import ProfileCompletionModal from './ProfileCompletionModal';
import { useAuth } from '../../hooks/useAuth';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import EnhancedLoginModal from '../enhanced/EnhancedLoginModal';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MissionScreen = () => {
  const { user, userProfile } = useAuth();
  const { requireAuth, showLoginModal, setShowLoginModal } = useAuthGuard();
  const [missions, setMissions] = useState([]);
  const [userScore, setUserScore] = useState(0);
  const [userLevel, setUserLevel] = useState({});
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [activeTab, setActiveTab] = useState('missions');
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    // Chỉ load data khi user đã đăng nhập
    if (user) {
      loadData();
    }
  }, [user]);

  // Hiển thị modal nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);

  useEffect(() => {
    // Đồng bộ trạng thái nhiệm vụ với Firestore
    if (userProfile) {
      syncMissionWithProfile();
    }
  }, [userProfile]);

  const syncMissionWithProfile = () => {
    if (userProfile?.profileCompleted) {
      // Nếu profile đã hoàn thành trong Firestore nhưng mission chưa cập nhật
      const missions = missionService.getMissions();
      const profileMission = missions.find(m => m.id === 'complete_profile');
      
      if (profileMission && profileMission.status === 'pending' && profileMission.currentProgress === 0) {
        missionService.updateMissionProgress('complete_profile', 1);
        missionService.claimMissionReward('complete_profile');
        loadData();
      }
    }
  };

  const loadData = () => {
    setMissions(missionService.getMissions());
    setUserScore(missionService.getUserScore());
    setUserLevel(missionService.getUserLevel());
    setUnlockedBadges(missionService.getUnlockedBadges());
  };

  const handleClaimReward = (missionId) => {
    return requireAuth(() => {
      const result = missionService.claimMissionReward(missionId);
      if (result.success) {
        loadData();
        notification.success({
          message: 'Thành công!',
          description: result.message
        });
      }
    }, {
      message: 'Đăng nhập để nhận thưởng',
      feature: 'nhận thưởng nhiệm vụ'
    });
  };

  const handleMissionAction = (mission) => {
    return requireAuth(() => {
      if (mission.id === 'complete_profile') {
        setShowProfileModal(true);
      }
    }, {
      message: 'Đăng nhập để thực hiện nhiệm vụ',
      feature: 'thực hiện nhiệm vụ'
    });
  };

  const handleProfileComplete = async (profileData) => {
    try {
      if (!user) return;
      
      // Cập nhật thông tin user trong Firestore
      await updateDoc(doc(db, 'users', user.uid), profileData);
      
      // Cập nhật tiến độ nhiệm vụ
      missionService.updateMissionProgress('complete_profile', 1);
      
      // Tự động nhận thưởng khi hoàn thành
      const result = missionService.claimMissionReward('complete_profile');
      
      // Reload mission data
      loadData();
      
      setShowProfileModal(false);
      notification.success({
        message: 'Hoàn thành nhiệm vụ!',
        description: result.success ? result.message : 'Hoàn thiện hồ sơ thành công!'
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra, vui lòng thử lại'
      });
    }
  };

  const getButtonState = (mission) => {
    const buttonProps = {
      className: 'w-full',
      size: window.innerWidth < 768 ? 'small' : 'middle'
    };
    
    if (mission.status === 'claimed') return <Button {...buttonProps} disabled>Đã nhận</Button>;
    if (mission.status === 'completed') return <Button {...buttonProps} type="primary" onClick={() => handleClaimReward(mission.id)}>Nhận thưởng</Button>;
    if (mission.status === 'locked') return <Button {...buttonProps} disabled>🔒 Khóa</Button>;
    return <Button {...buttonProps} type="default" onClick={() => handleMissionAction(mission)}>Thực hiện</Button>;
  };

  const progressPercent = Math.min(100, (userScore / ULTIMATE_REWARD.threshold) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Title level={2} className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            <TrophyOutlined style={{ color: '#faad14' }} /> Hệ thống nhiệm vụ
          </Title>
          <Text className="text-gray-600">Hoàn thành nhiệm vụ để nâng cao uy tín</Text>
        </div>

        {/* User Stats Card */}
        <Card className="mb-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} className="text-center">
              <div style={{ fontSize: window.innerWidth < 768 ? '36px' : '48px' }}>{userLevel.icon}</div>
              <Title level={window.innerWidth < 768 ? 5 : 4} style={{ color: 'white', margin: 0 }}>{userLevel.level}</Title>
            </Col>
            <Col xs={24} sm={8} className="text-center">
              <Title level={window.innerWidth < 768 ? 3 : 2} style={{ color: 'white', margin: 0 }}>{userScore}</Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Điểm uy tín</Text>
            </Col>
            <Col xs={24} sm={8} className="text-center">
              <Title level={window.innerWidth < 768 ? 5 : 4} style={{ color: 'white', margin: 0 }}>Mục tiêu: {userLevel.nextLevel}</Title>
              <Progress percent={Math.min(100, (userScore / userLevel.nextLevel) * 100)} showInfo={false} strokeColor="white" />
            </Col>
          </Row>
        </Card>

        {/* Ultimate Reward Card */}
        <Card className="mb-6" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', border: '2px solid #faad14' }}>
          <Row align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={4} className="text-center">
              <div style={{ fontSize: window.innerWidth < 768 ? '48px' : '64px' }}>🥈</div>
            </Col>
            <Col xs={24} sm={14}>
              <Title level={window.innerWidth < 768 ? 5 : 4} style={{ margin: 0 }}>{ULTIMATE_REWARD.title}</Title>
              <Text className="text-sm md:text-base">{ULTIMATE_REWARD.description}</Text>
              <div style={{ marginTop: '10px' }}>
                <Text strong className="text-xs md:text-sm">Tiến độ: {userScore.toLocaleString()} / {ULTIMATE_REWARD.threshold.toLocaleString()}</Text>
                <Progress percent={progressPercent} strokeColor="#faad14" />
              </div>
            </Col>
            <Col xs={24} sm={6} className="text-center">
              <Button 
                type="primary" 
                size={window.innerWidth < 768 ? 'middle' : 'large'} 
                disabled={userScore < ULTIMATE_REWARD.threshold}
                className="w-full sm:w-auto"
              >
                {userScore >= ULTIMATE_REWARD.threshold ? 'Nhận ngay!' : 'Chưa đủ điều kiện'}
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          className="bg-white rounded-lg p-4"
          items={[
            {
              key: 'missions',
              label: 'Nhiệm vụ',
              children: (
            <Row gutter={[12, 12]}>
              {missions.map(mission => (
                <Col xs={24} sm={12} lg={8} key={mission.id}>
                  <Card 
                    hoverable 
                    className="h-full transition-all duration-200 hover:shadow-lg" 
                    style={{ opacity: mission.status === 'claimed' ? 0.6 : 1 }}
                  >
                    <div className="text-center mb-4">
                      <div style={{ fontSize: window.innerWidth < 768 ? '36px' : '48px' }}>
                        {mission.icon === 'person' && '👤'}
                        {mission.icon === 'edit_note' && '📝'}
                        {mission.icon === 'favorite' && '❤️'}
                        {mission.icon === 'login' && '🔑'}
                        {mission.icon === 'help' && '🤝'}
                      </div>
                    </div>
                    
                    <Title level={5} className="text-base md:text-lg mb-2">{mission.title}</Title>
                    <Text type="secondary" className="text-sm">{mission.description}</Text>
                    
                    <div className="my-4">
                      <Badge count={`+${mission.reward}`} style={{ backgroundColor: '#52c41a' }} />
                    </div>

                    {mission.status !== 'claimed' && mission.status !== 'locked' && (
                      <div className="mb-4">
                        <Text strong className="text-sm">Tiến độ: {mission.currentProgress}/{mission.maxProgress}</Text>
                        <Progress percent={(mission.currentProgress / mission.maxProgress) * 100} size="small" />
                      </div>
                    )}

                    <div className="w-full">
                      {getButtonState(mission)}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
              )
            },
            {
              key: 'badges',
              label: 'Danh hiệu',
              children: (
            <Row gutter={[12, 12]}>
              {Object.entries(BADGES).map(([key, badge]) => {
                const isUnlocked = unlockedBadges.includes(key);
                return (
                  <Col xs={12} sm={8} lg={6} key={key}>
                    <Card 
                      className="text-center h-full" 
                      style={{ 
                        opacity: isUnlocked ? 1 : 0.5, 
                        background: isUnlocked ? '#f6ffed' : '#f5f5f5' 
                      }}
                    >
                      <div style={{ fontSize: window.innerWidth < 768 ? '36px' : '48px', marginBottom: '12px' }}>
                        {badge.icon}
                      </div>
                      <Title level={5} className="text-sm md:text-base mb-2">{badge.label}</Title>
                      <Text type="secondary" className="text-xs md:text-sm">{badge.description}</Text>
                      <div className="mt-3">
                        {isUnlocked ? (
                          <Badge status="success" text="Đã đạt" />
                        ) : (
                          <Badge status="default" text={`Cần ${badge.minScore} điểm`} />
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
              )
            }
          ]}
        />

        {/* Debug Panel */}
        <Card className="mt-6" style={{ background: '#f0f0f0' }}>
          <Title level={5} className="text-base mb-4">🔧 Panel Debug</Title>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => { missionService.addUserScore(100); loadData(); }} 
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            >
              +100 điểm
            </Button>
            <Button 
              onClick={() => { missionService.updateMissionProgress('first_post', 1); loadData(); }}
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            >
              Hoàn thành bài viết
            </Button>
            <Button 
              danger 
              onClick={() => { missionService.resetData(); loadData(); }}
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            >
              Reset
            </Button>
          </div>
        </Card>
        
        {/* Profile Completion Modal */}
        <ProfileCompletionModal
          visible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onComplete={handleProfileComplete}
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

export default MissionScreen;