import { doc, updateDoc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { MISSIONS_CONSTANTS } from '../constants';

/**
 * Missions Service - Xử lý tất cả logic liên quan đến missions
 * Bao gồm: quản lý nhiệm vụ, điểm số, badges, levels
 */
export const missionsService = {
  /**
   * Lấy dữ liệu missions của user từ Firestore
   * @param {string} userId - ID của user
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getUserMissionsData(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'userMissions', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          success: true,
          data: {
            ...data,
            unlockedBadges: Array.isArray(data.unlockedBadges) ? data.unlockedBadges : [],
            selectedProfessionBadge: data.selectedProfessionBadge || null,
            selectedDisplayBadge: data.selectedDisplayBadge || data.selectedProfessionBadge || null
          }
        };
      }
      
      // Tạo dữ liệu mặc định nếu chưa có
      const defaultData = {
        score: 0,
        missions: MISSIONS_CONSTANTS.DEFAULT_MISSIONS,
        unlockedBadges: [],
        selectedProfessionBadge: null,
        selectedDisplayBadge: null,
        dailyLoginStreak: 0,
        lastLoginDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'userMissions', userId), defaultData);
      return { success: true, data: defaultData };
    } catch (error) {
      console.error('Error getting user missions data:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cập nhật dữ liệu missions của user
   * @param {string} userId - ID của user
   * @param {object} data - Dữ liệu cần cập nhật
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateUserMissionsData(userId, data) {
    try {
      await updateDoc(doc(db, 'userMissions', userId), {
        ...data,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user missions data:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Thực hiện nhiệm vụ với dữ liệu bổ sung
   * @param {string} userId - ID của user
   * @param {string} missionId - ID của nhiệm vụ
   * @param {object} additionalData - Dữ liệu bổ sung (cho modal)
   * @returns {Promise<{success: boolean, completed?: boolean, error?: string}>}
   */
  async executeMission(userId, missionId, additionalData = null) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const missions = userData.missions.map(mission => {
        if (mission.id === missionId && mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.PENDING) {
          // Xử lý logic riêng cho từng nhiệm vụ
          if (missionId === 'add_farm_address' && additionalData) {
            // Lưu thông tin địa chỉ canh tác vào user profile
            this.updateUserProfile(userId, {
              farmAddress: additionalData.farmAddress,
              farmType: additionalData.farmType,
              farmDescription: additionalData.description
            });
            
            return {
              ...mission,
              currentProgress: mission.maxProgress,
              status: MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED
            };
          }
          
          if (missionId === 'add_farm_area' && additionalData) {
            // Lưu thông tin diện tích canh tác vào user profile
            this.updateUserProfile(userId, {
              farmArea: additionalData.farmArea,
              cropType: additionalData.cropType,
              farmingMethod: additionalData.farmingMethod,
              farmNotes: additionalData.notes
            });
            
            return {
              ...mission,
              currentProgress: mission.maxProgress,
              status: MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED
            };
          }
          
          if (missionId === 'verify_phone') {
            // Đối với xác minh số điện thoại, chuyển sang trạng thái chờ xác thực
            return {
              ...mission,
              currentProgress: mission.maxProgress,
              status: MISSIONS_CONSTANTS.MISSION_STATUS.WAITING_VERIFICATION
            };
          }
          
          // Logic mặc định cho các nhiệm vụ khác
          const newProgress = Math.min(mission.currentProgress + 1, mission.maxProgress);
          const isCompleted = newProgress >= mission.maxProgress;
          
          return {
            ...mission,
            currentProgress: newProgress,
            status: isCompleted ? MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED : mission.status
          };
        }
        return mission;
      });

      const updateResult = await this.updateUserMissionsData(userId, { missions });
      const completedMission = missions.find(m => m.id === missionId);
      
      return {
        success: updateResult.success,
        completed: completedMission?.status === MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED,
        waitingVerification: completedMission?.status === MISSIONS_CONSTANTS.MISSION_STATUS.WAITING_VERIFICATION,
        error: updateResult.error
      };
    } catch (error) {
      console.error('Error executing mission:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cập nhật nhiệm vụ nhận like dựa trên số lượng likes
   * @param {string} userId - ID của user (chủ bài viết)
   * @returns {Promise<{success: boolean, newScore?: number, error?: string}>}
   */
  async updateLikeMission(userId) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const mission = userData.missions.find(m => m.id === 'get_first_like');
      
      if (!mission) {
        return { success: true, message: 'Nhiệm vụ không tồn tại' };
      }

      // Kiểm tra nếu đã đạt tối đa 500 điểm thì không cộng nữa
      const maxPoints = 500;
      const currentLikePoints = mission.currentProgress * mission.reward;
      
      if (currentLikePoints >= maxPoints) {
        return { success: true, message: 'Đã đạt tối đa 500 điểm từ likes' };
      }

      // Đếm số likes mà user nhận được (từ các bài viết của user)
      // Cần lấy danh sách posts của user trước
      const postsRef = collection(db, 'posts');
      const postsQuery = query(postsRef, where('authorId', '==', userId));
      const postsSnapshot = await getDocs(postsQuery);
      const userPostIds = postsSnapshot.docs.map(doc => doc.id);

      if (userPostIds.length === 0) {
        return { success: true, message: 'Chưa có bài viết nào' };
      }

      // Đếm tổng số likes trên tất cả bài viết của user
      const likesRef = collection(db, 'likes');
      const likesQuery = query(likesRef, where('postId', 'in', userPostIds));
      const likesSnapshot = await getDocs(likesQuery);
      const likeCount = likesSnapshot.size;

      // Tính điểm mới, giới hạn tối đa 500 điểm
      const maxLikes = Math.floor(maxPoints / mission.reward); // 500/1 = 500 likes
      const newProgress = Math.min(likeCount, maxLikes);
      const pointsEarned = newProgress * mission.reward;
      const pointsDifference = pointsEarned - currentLikePoints;
      const newScore = userData.score + pointsDifference;
      
      const missions = userData.missions.map(m => 
        m.id === 'get_first_like' ? { 
          ...m, 
          currentProgress: newProgress
        } : m
      );

      const updateResult = await this.updateUserMissionsData(userId, {
        score: newScore,
        missions
      });

      return {
        success: updateResult.success,
        newScore,
        likeCount,
        pointsEarned: pointsDifference,
        maxReached: pointsEarned >= maxPoints,
        error: updateResult.error
      };
    } catch (error) {
      console.error('Error updating like mission:', error);
      return { success: false, error: error.message };
    }
  },
  async updateFollowMission(userId) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const mission = userData.missions.find(m => m.id === 'make_friends');
      
      if (!mission) {
        return { success: true, message: 'Nhiệm vụ không tồn tại' };
      }

      // Kiểm tra nếu đã đạt tối đa 500 điểm thì không cộng nữa
      const maxPoints = 500;
      const currentFollowPoints = mission.currentProgress * mission.reward;
      
      if (currentFollowPoints >= maxPoints) {
        return { success: true, message: 'Đã đạt tối đa 500 điểm từ follow' };
      }

      // Đếm số người user đang follow
      const followsRef = collection(db, 'follows');
      const q = query(followsRef, where('followerId', '==', userId));
      const snapshot = await getDocs(q);
      const followCount = snapshot.size;

      // Tính điểm mới, giới hạn tối đa 500 điểm
      const maxFollows = Math.floor(maxPoints / mission.reward); // 500/5 = 100 follows
      const newProgress = Math.min(followCount, maxFollows);
      const pointsEarned = newProgress * mission.reward;
      const pointsDifference = pointsEarned - currentFollowPoints;
      const newScore = userData.score + pointsDifference;
      
      const missions = userData.missions.map(m => 
        m.id === 'make_friends' ? { 
          ...m, 
          currentProgress: newProgress
        } : m
      );

      const updateResult = await this.updateUserMissionsData(userId, {
        score: newScore,
        missions
      });

      return {
        success: updateResult.success,
        newScore,
        followCount,
        pointsEarned: pointsDifference,
        maxReached: pointsEarned >= maxPoints,
        error: updateResult.error
      };
    } catch (error) {
      console.error('Error updating follow mission:', error);
      return { success: false, error: error.message };
    }
  },
  async updateUserProfile(userId, profileData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...profileData,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Xác thực số điện thoại (gọi từ admin)
   * @param {string} userId - ID của user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async verifyUserPhone(userId) {
    try {
      // 1. Cập nhật hồ sơ user trước để đảm bảo tính nhất quán
      await this.updateUserProfile(userId, { 
        phoneVerified: true,
        verificationStatus: 'verified' 
      });

      // 2. Lấy dữ liệu missions
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      let rewardEarned = 0;
      let missionFound = false;
      
      // Đảm bảo missions luôn là mảng
      const currentMissions = Array.isArray(userData.missions) ? userData.missions : MISSIONS_CONSTANTS.DEFAULT_MISSIONS;

      const updatedMissions = currentMissions.map(mission => {
        if (mission.id === 'verify_phone') {
          missionFound = true;
          // Nếu nhiệm vụ chưa hoàn thành hoặc đang chờ, chuyển sang trạng thái COMPLETED để hiện nút "Nhận thưởng"
          if (mission.status !== MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED) {
            return {
              ...mission,
              currentProgress: mission.maxProgress || 1,
              status: MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED
            };
          }
        }
        return mission;
      });

      // Nếu trong data của user thiếu mission verify_phone, ta thêm vào luôn ở trạng thái COMPLETED
      if (!missionFound) {
        const defaultVerifyMission = MISSIONS_CONSTANTS.DEFAULT_MISSIONS.find(m => m.id === 'verify_phone');
        updatedMissions.push({
          ...(defaultVerifyMission || {}),
          id: 'verify_phone',
          currentProgress: 1,
          maxProgress: 1,
          status: MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED
        });
      }

      // 3. Không cộng điểm trực tiếp ở đây để user tự bấm nhận thưởng cho đúng quy trình
      const newScore = userData.score || 0;
      const newBadges = this.checkUnlockedBadges(newScore, userData.unlockedBadges || []);

      // 4. Lưu lại toàn bộ
      const updateResult = await this.updateUserMissionsData(userId, { 
        missions: updatedMissions,
        score: newScore,
        unlockedBadges: newBadges
      });

      return {
        success: updateResult.success,
        error: updateResult.error
      };
    } catch (error) {
      console.error('Error verifying user phone:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Hủy xác thực số điện thoại (gọi từ admin)
   * @param {string} userId - ID của user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async unverifyUserPhone(userId) {
    try {
      // 1. Lấy dữ liệu missions
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const currentMissions = Array.isArray(userData.missions) ? userData.missions : MISSIONS_CONSTANTS.DEFAULT_MISSIONS;

      // 2. Tìm nhiệm vụ verify_phone và kiểm tra trạng thái
      const verifyMission = currentMissions.find(m => m.id === 'verify_phone');
      let pointsToDeduct = 0;

      // Nếu nhiệm vụ đã claimed (đã nhận thưởng), trừ điểm
      if (verifyMission && verifyMission.status === MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED) {
        pointsToDeduct = verifyMission.reward || 50;
      }

      // 3. Reset nhiệm vụ về trạng thái pending
      const updatedMissions = currentMissions.map(mission => {
        if (mission.id === 'verify_phone') {
          return {
            ...mission,
            currentProgress: 0,
            status: MISSIONS_CONSTANTS.MISSION_STATUS.PENDING
          };
        }
        return mission;
      });

      // 4. Trừ điểm nếu đã nhận thưởng
      const newScore = Math.max(0, (userData.score || 0) - pointsToDeduct);
      const newBadges = this.checkUnlockedBadges(newScore, userData.unlockedBadges || []);

      // 5. Lưu lại
      const updateResult = await this.updateUserMissionsData(userId, { 
        missions: updatedMissions,
        score: newScore,
        unlockedBadges: newBadges
      });

      return {
        success: updateResult.success,
        pointsDeducted: pointsToDeduct,
        error: updateResult.error
      };
    } catch (error) {
      console.error('Error unverifying user phone:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cập nhật tiến độ nhiệm vụ
   * @param {string} userId - ID của user
   * @param {string} missionId - ID của nhiệm vụ
   * @param {number} progress - Tiến độ mới
   * @returns {Promise<{success: boolean, completed?: boolean, error?: string}>}
   */
  async updateMissionProgress(userId, missionId, progress = 1) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const missions = userData.missions.map(mission => {
        if (mission.id === missionId && mission.status === MISSIONS_CONSTANTS.MISSION_STATUS.PENDING) {
          const newProgress = Math.min(mission.currentProgress + progress, mission.maxProgress);
          const isCompleted = newProgress >= mission.maxProgress;
          
          return {
            ...mission,
            currentProgress: newProgress,
            status: isCompleted ? MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED : mission.status
          };
        }
        return mission;
      });

      const updateResult = await this.updateUserMissionsData(userId, { missions });
      const completedMission = missions.find(m => m.id === missionId);
      
      return {
        success: updateResult.success,
        completed: completedMission?.status === MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED,
        error: updateResult.error
      };
    } catch (error) {
      console.error('Error updating mission progress:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Nhận thưởng nhiệm vụ
   * @param {string} userId - ID của user
   * @param {string} missionId - ID của nhiệm vụ
   * @returns {Promise<{success: boolean, reward?: number, newScore?: number, error?: string}>}
   */
  async claimMissionReward(userId, missionId) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const mission = userData.missions.find(m => m.id === missionId);
      
      if (!mission) {
        return { success: false, error: 'Không tìm thấy nhiệm vụ' };
      }
      
      if (mission.status !== MISSIONS_CONSTANTS.MISSION_STATUS.COMPLETED) {
        return { success: false, error: 'Nhiệm vụ chưa hoàn thành' };
      }

      // Cập nhật trạng thái nhiệm vụ và điểm số
      const newScore = userData.score + mission.reward;
      const missions = userData.missions.map(m => 
        m.id === missionId ? { ...m, status: MISSIONS_CONSTANTS.MISSION_STATUS.CLAIMED } : m
      );

      // Kiểm tra badges mới được mở khóa
      const newBadges = this.checkUnlockedBadges(newScore, userData.unlockedBadges);

      const updateResult = await this.updateUserMissionsData(userId, {
        score: newScore,
        missions,
        unlockedBadges: newBadges
      });

      return {
        success: updateResult.success,
        reward: mission.reward,
        newScore,
        newBadges: newBadges.filter(badge => !userData.unlockedBadges.includes(badge)),
        error: updateResult.error
      };
    } catch (error) {
      console.error('Error claiming mission reward:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Kiểm tra badges mới được mở khóa
   * @param {number} score - Điểm số hiện tại
   * @param {string[]} currentBadges - Badges hiện tại
   * @returns {string[]} Danh sách badges đã mở khóa
   */
  checkUnlockedBadges(score, currentBadges = []) {
    const allBadges = Object.entries(MISSIONS_CONSTANTS.BADGES)
      .filter(([badgeKey, badge]) => {
        if (score < badge.minScore) return false;

        if (badge.requiresSelection && badge.selectionGroup === 'profession') {
          return currentBadges.includes(badgeKey);
        }

        return badge.autoUnlock || !badge.requiresSelection;
      })
      .map(([key, _]) => key);

    return [...new Set([...currentBadges, ...allBadges])];
  },

  /**
   * Kiểm tra xem user có đủ điểm để chọn badge chuyên môn không
   * @param {number} score - Điểm số hiện tại
   * @param {string[]} currentBadges - Badges hiện tại
   * @returns {boolean} True nếu đủ điểm và chưa chọn
   */
  canSelectProfessionBadge(score, currentBadges = []) {
    return score >= 500;
  },

  /**
   * Chọn badge chuyên môn cho user
   * @param {string} userId - ID của user
   * @param {string} badgeId - ID của badge được chọn (PRODUCER, SUPPLIER, hoặc TRADER)
   * @returns {Promise<object>} Kết quả
   */
  async selectProfessionBadge(userId, badgeId) {
    try {
      const validBadges = ['PRODUCER', 'SUPPLIER', 'TRADER'];
      if (!validBadges.includes(badgeId)) {
        return { success: false, error: 'Badge không hợp lệ' };
      }

      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;
      const userData = result.data;

      const currentBadges = Array.isArray(userData.unlockedBadges)
        ? userData.unlockedBadges
        : [];

      if (!this.canSelectProfessionBadge(userData.score, currentBadges)) {
        return { success: false, error: 'Bạn cần đạt ít nhất 500 điểm để chọn danh hiệu này' };
      }

      const cleanedBadges = currentBadges.filter(
        badge => !validBadges.includes(badge)
      );

      const updatedBadges = [...cleanedBadges, badgeId];

      await this.updateUserMissionsData(userId, {
        unlockedBadges: updatedBadges,
        selectedProfessionBadge: badgeId,
        selectedDisplayBadge: badgeId
      });

      return {
        success: true,
        badge: MISSIONS_CONSTANTS.BADGES[badgeId]
      };
    } catch (error) {
      console.error('Error selecting profession badge:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cleanup dữ liệu cũ - xóa các badge profession thừa
   * Dùng cho user đã có nhiều hơn 1 badge profession từ logic cũ
   * @param {string} userId - ID của user
   * @returns {Promise<object>} Kết quả
   */
  async cleanupProfessionBadges(userId) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;
      const userData = result.data;

      if (!userData || !Array.isArray(userData.unlockedBadges)) {
        return { success: true, cleaned: false, message: 'Không có dữ liệu badge' };
      }

      const professionBadges = ['PRODUCER', 'SUPPLIER', 'TRADER'];

      const userProfessionBadges = userData.unlockedBadges.filter(
        badge => professionBadges.includes(badge)
      );

      if (userProfessionBadges.length > 1) {
        const badgeToKeep = userProfessionBadges[0];
        const cleanedBadges = userData.unlockedBadges.filter(
          badge => !professionBadges.includes(badge) || badge === badgeToKeep
        );

        await this.updateUserMissionsData(userId, {
          unlockedBadges: cleanedBadges,
          selectedProfessionBadge: badgeToKeep,
          selectedDisplayBadge: userData.selectedDisplayBadge || badgeToKeep
        });

        return {
          success: true,
          cleaned: true,
          keptBadge: badgeToKeep,
          removedBadges: userProfessionBadges.filter(b => b !== badgeToKeep)
        };
      }

      return { success: true, cleaned: false, message: 'Không cần cleanup' };
    } catch (error) {
      console.error('Error cleaning up profession badges:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Lấy danh sách danh hiệu có thể hiển thị trên profile
   * @param {object} missionsData - Dữ liệu missions của user
   * @returns {string[]} Danh sách badge keys
   */
  getAvailableProfileBadges(missionsData = {}) {
    const unlockedBadges = Array.isArray(missionsData.unlockedBadges) ? missionsData.unlockedBadges : [];
    const validBadgeKeys = Object.keys(MISSIONS_CONSTANTS.BADGES);
    const professionBadges = ['PRODUCER', 'SUPPLIER', 'TRADER'];

    const available = [...unlockedBadges];

    if ((missionsData.score || 0) >= 500) {
      available.push(...professionBadges);
    }

    if (missionsData.selectedDisplayBadge) {
      available.push(missionsData.selectedDisplayBadge);
    }

    return [...new Set(available)].filter((badgeKey) => validBadgeKeys.includes(badgeKey));
  },

  /**
   * Cập nhật danh hiệu hiển thị trên profile
   * @param {string} userId - ID của user
   * @param {string|null} badgeId - Badge key
   * @returns {Promise<{success: boolean, badge?: object, error?: string}>}
   */
  async setProfileDisplayBadge(userId, badgeId) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const availableBadges = this.getAvailableProfileBadges(userData);
      const selectedBadge = badgeId || null;

      if (selectedBadge && !availableBadges.includes(selectedBadge)) {
        return { success: false, error: 'Danh hiệu chưa được mở khóa' };
      }

      const professionBadges = ['PRODUCER', 'SUPPLIER', 'TRADER'];
      const currentBadges = Array.isArray(userData.unlockedBadges) ? userData.unlockedBadges : [];
      const updatePayload = {
        selectedDisplayBadge: selectedBadge
      };

      if (selectedBadge && professionBadges.includes(selectedBadge)) {
        const cleanedBadges = currentBadges.filter((badge) => !professionBadges.includes(badge));
        updatePayload.unlockedBadges = [...cleanedBadges, selectedBadge];
        updatePayload.selectedProfessionBadge = selectedBadge;
      }

      const updateResult = await this.updateUserMissionsData(userId, updatePayload);
      if (!updateResult.success) return updateResult;

      return {
        success: true,
        badge: selectedBadge ? MISSIONS_CONSTANTS.BADGES[selectedBadge] : null
      };
    } catch (error) {
      console.error('Error setting profile display badge:', error);
      return { success: false, error: error.message };
    }
  },
  /**
   * Cập nhật daily login streak
   * @param {string} userId - ID của user
   * @returns {Promise<{success: boolean, streak?: number, error?: string}>}
   */
  async updateDailyLoginStreak(userId) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const today = new Date().toDateString();
      const lastLogin = userData.lastLoginDate ? new Date(userData.lastLoginDate).toDateString() : null;
      
      let newStreak = userData.dailyLoginStreak || 0;
      
      if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin === yesterday.toDateString()) {
          // Consecutive day
          newStreak += 1;
        } else if (lastLogin !== today) {
          // Reset streak if not consecutive
          newStreak = 1;
        }
        
        const updateResult = await this.updateUserMissionsData(userId, {
          dailyLoginStreak: newStreak,
          lastLoginDate: new Date()
        });
        
        // Cập nhật tiến độ nhiệm vụ daily login
        if (newStreak <= 7) {
          await this.updateMissionProgress(userId, 'daily_login', 1);
        }
        
        return {
          success: updateResult.success,
          streak: newStreak,
          error: updateResult.error
        };
      }
      
      return { success: true, streak: newStreak };
    } catch (error) {
      console.error('Error updating daily login streak:', error);
      return { success: false, error: error.message };
    }
  },



  /**
   * Cập nhật điểm cho recurring missions (like, friend)
   * @param {string} userId - ID của user
   * @param {string} missionId - ID của nhiệm vụ
   * @param {number} increment - Số điểm tăng thêm
   * @returns {Promise<{success: boolean, newScore?: number, error?: string}>}
   */
  async updateRecurringMission(userId, missionId, increment = 1) {
    try {
      const result = await this.getUserMissionsData(userId);
      if (!result.success) return result;

      const userData = result.data;
      const mission = userData.missions.find(m => m.id === missionId);
      
      if (!mission || !mission.recurring) {
        return { success: false, error: 'Không tìm thấy nhiệm vụ recurring' };
      }

      // Tự động tắt cộng điểm khi đạt 500 điểm (theo yêu cầu)
      if (userData.score >= 500 && missionId === 'get_first_like') {
        return { success: true, message: 'Đã tự động tắt cộng điểm khi đạt 500 điểm' };
      }

      const newScore = userData.score + (mission.reward * increment);
      const newProgress = Math.min(mission.currentProgress + increment, mission.maxProgress);
      
      const missions = userData.missions.map(m => 
        m.id === missionId ? { ...m, currentProgress: newProgress } : m
      );

      const updateResult = await this.updateUserMissionsData(userId, {
        score: newScore,
        missions
      });

      return {
        success: updateResult.success,
        newScore,
        increment: mission.reward * increment,
        error: updateResult.error
      };
    } catch (error) {
      console.error('Error updating recurring mission:', error);
      return { success: false, error: error.message };
    }
  }
};
