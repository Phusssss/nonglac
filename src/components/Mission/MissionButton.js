import React from 'react';
import { Button, Badge } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import missionService from '../../services/missionService';

const MissionButton = () => {
  const navigate = useNavigate();
  const userScore = missionService.getUserScore();
  const missions = missionService.getMissions();
  const completedMissions = missions.filter(m => m.status === 'completed').length;

  return (
    <Badge count={completedMissions} size="small">
      <Button 
        type="primary" 
        icon={<TrophyOutlined />}
        onClick={() => navigate('/missions')}
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