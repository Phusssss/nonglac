// Service quản lý nhiệm vụ và điểm uy tín
class MissionService {
  constructor() {
    this.storageKey = 'nonglac_missions';
    this.userScoreKey = 'nonglac_user_score';
  }

  // Lấy danh sách nhiệm vụ từ localStorage
  getMissions() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Import missions mặc định
    const { MISSIONS } = require('../data/missions');
    this.saveMissions(MISSIONS);
    return MISSIONS;
  }

  // Lưu danh sách nhiệm vụ
  saveMissions(missions) {
    localStorage.setItem(this.storageKey, JSON.stringify(missions));
  }

  // Cập nhật tiến độ nhiệm vụ
  updateMissionProgress(missionId, progress = 1) {
    const missions = this.getMissions();
    const mission = missions.find(m => m.id === missionId);
    
    if (mission && mission.status === 'pending') {
      mission.currentProgress = Math.min(mission.currentProgress + progress, mission.maxProgress);
      
      if (mission.currentProgress >= mission.maxProgress) {
        mission.status = 'completed';
      }
      
      this.saveMissions(missions);
      return mission;
    }
    
    return null;
  }

  // Nhận thưởng nhiệm vụ
  claimMissionReward(missionId) {
    const missions = this.getMissions();
    const mission = missions.find(m => m.id === missionId);
    
    if (mission && mission.status === 'completed') {
      mission.status = 'claimed';
      this.saveMissions(missions);
      
      // Cộng điểm uy tín
      this.addUserScore(mission.reward);
      
      // Mở khóa nhiệm vụ tiếp theo nếu có
      this.unlockNextMissions();
      
      return {
        success: true,
        reward: mission.reward,
        message: `Chúc mừng! Bạn nhận được ${mission.reward} điểm uy tín.`
      };
    }
    
    return {
      success: false,
      message: 'Không thể nhận thưởng nhiệm vụ này.'
    };
  }

  // Mở khóa nhiệm vụ tiếp theo
  unlockNextMissions() {
    const missions = this.getMissions();
    const userScore = this.getUserScore();
    
    missions.forEach(mission => {
      if (mission.status === 'locked') {
        // Logic mở khóa dựa trên điều kiện
        if (mission.id === 'get_likes' && this.isMissionCompleted('first_post')) {
          mission.status = 'pending';
        }
        if (mission.id === 'help_community' && userScore >= 300) {
          mission.status = 'pending';
        }
      }
    });
    
    this.saveMissions(missions);
  }

  // Kiểm tra nhiệm vụ đã hoàn thành
  isMissionCompleted(missionId) {
    const missions = this.getMissions();
    const mission = missions.find(m => m.id === missionId);
    return mission && (mission.status === 'completed' || mission.status === 'claimed');
  }

  // Lấy điểm uy tín người dùng
  getUserScore() {
    const stored = localStorage.getItem(this.userScoreKey);
    return stored ? parseInt(stored) : 0;
  }

  // Cộng điểm uy tín
  addUserScore(points) {
    const currentScore = this.getUserScore();
    const newScore = currentScore + points;
    localStorage.setItem(this.userScoreKey, newScore.toString());
    return newScore;
  }

  // Lấy cấp độ hiện tại
  getUserLevel() {
    const score = this.getUserScore();
    
    if (score >= 3000) return { level: 'Bậc thầy', nextLevel: 5000, icon: '👑' };
    if (score >= 1500) return { level: 'Chuyên gia', nextLevel: 3000, icon: '🏆' };
    if (score >= 500) return { level: 'Nông dân', nextLevel: 1500, icon: '🚜' };
    return { level: 'Người mới', nextLevel: 500, icon: '🌱' };
  }

  // Lấy danh hiệu đã mở khóa
  getUnlockedBadges() {
    const score = this.getUserScore();
    const badges = [];
    
    if (score >= 0) badges.push('newbie');
    if (score >= 500) badges.push('farmer');
    if (score >= 1500) badges.push('expert');
    if (score >= 3000) badges.push('master');
    
    return badges;
  }

  // Reset dữ liệu (để test)
  resetData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userScoreKey);
  }
}

const missionService = new MissionService();
export default missionService;