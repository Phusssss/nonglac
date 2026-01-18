import React from 'react';
import { Button, Badge } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import missionService from '../../services/missionService';

const MissionButton = () => {
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();
  const userScore = missionService.getUserScore();
  const missions = missionService.getMissions();
  const completedMissions = missions.filter(m => m.status === 'completed').length;

  const handleMissionClick = () => {
    return requireAuth(() => {
      navigate('/missions');
    }, {
      showModal: false, // Redirect trực tiếp thay vì modal
      message: 'Đăng nhập để xem nhiệm vụ',
      feature: 'xem hệ thống nhiệm vụ'
    });
  };

  return (
    <Badge count={completedMissions} size="small">
      <Button 
        type="primary" 
        icon={<TrophyOutlined />}
        onClick={handleMissionClick}
        style={{ 
          background: '#faad14',
          borderColor: '#faad14'
        }}
      >
        Nhiệm vụ ({userScore})
      </Button>
    </Badge>
  );
};

export default MissionButton;