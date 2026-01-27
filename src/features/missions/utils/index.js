import { MISSIONS_CONSTANTS } from '../constants';

/**
 * Missions Utils - Các hàm tiện ích cho missions feature
 */
export const missionsUtils = {
  /**
   * Tính AgriTrust Score dựa trên 3 lớp dữ liệu
   * @param {object} userData - Dữ liệu user
   * @returns {number} AgriTrust Score
   */
  calculateAgriTrustScore(userData) {
    const { missions = [], score = 0 } = userData;
    
    // Tính điểm theo từng lớp
    const layer1Score = missions
      .filter(m => m.layer === 1 && m.status === MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED)
      .reduce((sum, m) => sum + m.reward, 0);
    
    const layer2Score = missions
      .filter(m => m.layer === 2 && m.status === MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED)
      .reduce((sum, m) => sum + m.reward, 0);
    
    const layer3Score = missions
      .filter(m => m.layer === 3 && m.status === MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED)
      .reduce((sum, m) => sum + m.reward, 0);
    
    // Áp dụng trọng số
    const weightedScore = 
      (layer1Score * MISSIONS_CONSTANTS.AGRI_TRUST.WEIGHTS.IDENTITY) +
      (layer2Score * MISSIONS_CONSTANTS.AGRI_TRUST.WEIGHTS.BEHAVIOR) +
      (layer3Score * MISSIONS_CONSTANTS.AGRI_TRUST.WEIGHTS.FINANCIAL);
    
    return Math.round(weightedScore + score);
  },

  /**
   * Lấy cấp độ AgriTrust dựa trên điểm
   * @param {number} score - Điểm AgriTrust
   * @returns {object} Thông tin cấp độ
   */
  getAgriTrustLevel(score) {
    const levels = Object.values(MISSIONS_CONSTANTS.AGRI_TRUST.LEVELS);
    return levels.find(level => score >= level.min && score <= level.max) || levels[0];
  },
  getMissionIcon(iconName) {
    const iconMap = {
      'person': '👤',
      'edit_note': '📝',
      'favorite': '❤️',
      'login': '🔑',
      'help': '🤝',
      'trophy': '🏆',
      'star': '⭐',
      'fire': '🔥',
      'target': '🎯',
      'gift': '🎁'
    };
    return iconMap[iconName] || '📋';
  },

  /**
   * Lấy màu sắc cho mission status
   * @param {string} status - Trạng thái mission
   * @returns {string} Màu sắc
   */
  getStatusColor(status) {
    const colorMap = {
      [MISSIONS_CONSTANTS.MISSION_STATUS.PENDING]: '#d9d9d9',
      [MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED]: MISSIONS_CONSTANTS.COLORS.SUCCESS,
      [MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED]: MISSIONS_CONSTANTS.COLORS.SECONDARY,
      [MISSIONS_CONSTANTS.MISSION_STATUS.LOCKED]: '#f5f5f5',
      [MISSIONS_CONSTANTS.MISSION_STATUS.WAITING_VERIFICATION]: MISSIONS_CONSTANTS.COLORS.WARNING
    };
    return colorMap[status] || '#d9d9d9';
  },

  /**
   * Lấy text cho mission status
   * @param {string} status - Trạng thái mission
   * @returns {string} Text hiển thị
   */
  getStatusText(status) {
    const textMap = {
      [MISSIONS_CONSTANTS.MISSION_STATUS.PENDING]: MISSIONS_CONSTANTS.MESSAGES.BUTTONS.COMPLETE,
      [MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED]: MISSIONS_CONSTANTS.MESSAGES.BUTTONS.CLAIM,
      [MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED]: MISSIONS_CONSTANTS.MESSAGES.BUTTONS.CLAIMED,
      [MISSIONS_CONSTANTS.MISSION_STATUS.LOCKED]: MISSIONS_CONSTANTS.MESSAGES.BUTTONS.LOCKED,
      [MISSIONS_CONSTANTS.MISSION_STATUS.WAITING_VERIFICATION]: MISSIONS_CONSTANTS.MESSAGES.BUTTONS.WAITING_VERIFICATION
    };
    return textMap[status] || 'Không xác định';
  },

  /**
   * Kiểm tra mission có thể thực hiện không
   * @param {object} mission - Thông tin mission
   * @returns {boolean}
   */
  canExecuteMission(mission) {
    return mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.PENDING;
  },

  /**
   * Kiểm tra mission có thể nhận thưởng không
   * @param {object} mission - Thông tin mission
   * @returns {boolean}
   */
  canClaimReward(mission) {
    return mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED;
  },

  /**
   * Tính phần trăm hoàn thành mission
   * @param {object} mission - Thông tin mission
   * @returns {number} Phần trăm (0-100)
   */
  getProgressPercent(mission) {
    if (!mission.maxProgress || mission.maxProgress === 0) return 0;
    return Math.min(100, (mission.currentProgress / mission.maxProgress) * 100);
  },

  /**
   * Format số điểm với dấu phẩy
   * @param {number} score - Số điểm
   * @returns {string} Số điểm đã format
   */
  formatScore(score) {
    return score.toLocaleString('vi-VN');
  },

  /**
   * Lấy thông tin badge theo ID
   * @param {string} badgeId - ID của badge
   * @returns {object|null} Thông tin badge
   */
  getBadgeInfo(badgeId) {
    return MISSIONS_CONSTANTS.BADGES[badgeId] || null;
  },

  /**
   * Lấy màu sắc cho badge type
   * @param {string} type - Loại badge
   * @returns {string} Màu sắc
   */
  getBadgeColor(type) {
    const colorMap = {
      [MISSIONS_CONSTANTS.BADGE_TYPES.BRONZE]: '#cd7f32',
      [MISSIONS_CONSTANTS.BADGE_TYPES.SILVER]: '#c0c0c0',
      [MISSIONS_CONSTANTS.BADGE_TYPES.GOLD]: '#ffd700',
      [MISSIONS_CONSTANTS.BADGE_TYPES.DIAMOND]: '#b9f2ff'
    };
    return colorMap[type] || '#d9d9d9';
  },

  /**
   * Sắp xếp missions theo độ ưu tiên
   * @param {array} missions - Danh sách missions
   * @returns {array} Missions đã sắp xếp
   */
  sortMissionsByPriority(missions) {
    const priorityOrder = {
      [MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED]: 1,
      [MISSIONS_CONSTANTS.MISSION_STATUS.PENDING]: 2,
      [MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED]: 3,
      [MISSIONS_CONSTANTS.MISSION_STATUS.LOCKED]: 4
    };

    return [...missions].sort((a, b) => {
      const priorityA = priorityOrder[a.status] || 5;
      const priorityB = priorityOrder[b.status] || 5;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Nếu cùng priority, sắp xếp theo reward (cao -> thấp)
      return b.reward - a.reward;
    });
  },

  /**
   * Lấy missions theo type
   * @param {array} missions - Danh sách missions
   * @param {string} type - Loại mission
   * @returns {array} Missions đã lọc
   */
  getMissionsByType(missions, type) {
    return missions.filter(mission => mission.type === type);
  },

  /**
   * Tính tổng reward có thể nhận
   * @param {array} missions - Danh sách missions
   * @returns {number} Tổng reward
   */
  getTotalAvailableReward(missions) {
    return missions
      .filter(mission => mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED)
      .reduce((total, mission) => total + mission.reward, 0);
  },

  /**
   * Kiểm tra có missions hoàn thành chưa nhận thưởng không
   * @param {array} missions - Danh sách missions
   * @returns {boolean}
   */
  hasUnclaimedRewards(missions) {
    return missions.some(mission => mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED);
  },

  /**
   * Lấy level tiếp theo
   * @param {number} currentScore - Điểm hiện tại
   * @returns {object|null} Thông tin level tiếp theo
   */
  getNextLevel(currentScore) {
    const levels = Object.values(MISSIONS_CONSTANTS.AGRI_TRUST.LEVELS);
    return levels.find(level => level.min > currentScore) || null;
  },

  /**
   * Tính điểm cần thiết để lên level tiếp theo
   * @param {number} currentScore - Điểm hiện tại
   * @returns {number} Điểm cần thiết
   */
  getPointsToNextLevel(currentScore) {
    const nextLevel = this.getNextLevel(currentScore);
    return nextLevel ? nextLevel.min - currentScore : 0;
  },

  /**
   * Validate dữ liệu mission
   * @param {object} mission - Dữ liệu mission
   * @returns {object} Kết quả validate
   */
  validateMission(mission) {
    const errors = {};
    
    if (!mission.id) {
      errors.id = 'ID mission là bắt buộc';
    }
    
    if (!mission.title?.trim()) {
      errors.title = 'Tiêu đề mission là bắt buộc';
    }
    
    if (!mission.description?.trim()) {
      errors.description = 'Mô tả mission là bắt buộc';
    }
    
    if (!mission.reward || mission.reward <= 0) {
      errors.reward = 'Phần thưởng phải lớn hơn 0';
    }
    
    if (!mission.maxProgress || mission.maxProgress <= 0) {
      errors.maxProgress = 'Tiến độ tối đa phải lớn hơn 0';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};