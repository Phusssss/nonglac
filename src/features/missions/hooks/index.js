import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { missionsService } from '../services';
import { missionsUtils } from '../utils';
import { MISSIONS_CONSTANTS } from '../constants';

/**
 * Custom hook quản lý missions và user progress
 * Cung cấp các function để cập nhật nhiệm vụ, nhận thưởng, quản lý badges
 */
export const useMissions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [missionsData, setMissionsData] = useState({
    score: 0,
    missions: [],
    unlockedBadges: [],
    dailyLoginStreak: 0
  });

  /**
   * Load dữ liệu missions từ Firestore
   */
  const loadMissionsData = useCallback(async () => {
    if (!user?.uid) {
      setMissionsData({
        score: 0,
        missions: [],
        unlockedBadges: [],
        dailyLoginStreak: 0
      });
      return;
    }

    setLoading(true);
    try {
      const result = await missionsService.getUserMissionsData(user.uid);
      if (result.success) {
        setMissionsData(result.data);
      }
    } catch (error) {
      console.error('Error loading missions data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load data khi user thay đổi
  useEffect(() => {
    loadMissionsData();
  }, [loadMissionsData]);

  // Cập nhật daily login streak khi user đăng nhập
  useEffect(() => {
    if (user?.uid) {
      missionsService.updateDailyLoginStreak(user.uid).then(() => {
        loadMissionsData();
      });
    }
  }, [user?.uid, loadMissionsData]);

  /**
   * Thực hiện nhiệm vụ (với dữ liệu bổ sung)
   */
  const executeMission = useCallback(async (mission, additionalData = null) => {
    if (!user?.uid) return { success: false, error: 'Chưa đăng nhập' };

    const result = await missionsService.executeMission(user.uid, mission.id, additionalData);
    if (result.success) {
      await loadMissionsData();
    }
    return result;
  }, [user?.uid, loadMissionsData]);

  /**
   * Cập nhật tiến độ nhiệm vụ
   */
  const updateMissionProgress = useCallback(async (missionId, progress = 1) => {
    if (!user?.uid) return { success: false, error: 'Chưa đăng nhập' };

    const result = await missionsService.updateMissionProgress(user.uid, missionId, progress);
    if (result.success) {
      await loadMissionsData();
    }
    return result;
  }, [user?.uid, loadMissionsData]);

  /**
   * Nhận thưởng nhiệm vụ
   */
  const claimMissionReward = useCallback(async (missionId) => {
    if (!user?.uid) return { success: false, error: 'Chưa đăng nhập' };

    const result = await missionsService.claimMissionReward(user.uid, missionId);
    if (result.success) {
      await loadMissionsData();
    }
    return result;
  }, [user?.uid, loadMissionsData]);

  /**
   * Lấy thông tin level hiện tại
   */
  const getCurrentLevel = useCallback(() => {
    return missionsUtils.getAgriTrustLevel(missionsData.score);
  }, [missionsData.score]);

  /**
   * Kiểm tra xem có badges mới được mở khóa không
   */
  const getNewBadges = useCallback((newScore) => {
    const allUnlocked = missionsService.checkUnlockedBadges(newScore, []);
    return allUnlocked.filter(badge => !missionsData.unlockedBadges.includes(badge));
  }, [missionsData.unlockedBadges]);

  /**
   * Lấy tiến độ đến ultimate reward
   */
  const getUltimateProgress = useCallback(() => {
    const threshold = MISSIONS_CONSTANTS.PHYSICAL_REWARDS.SILVER_BUTTON.threshold;
    const progress = Math.min(100, (missionsData.score / threshold) * 100);
    const canClaim = missionsData.score >= threshold;
    
    return {
      progress,
      canClaim,
      remaining: Math.max(0, threshold - missionsData.score)
    };
  }, [missionsData.score]);

  return {
    // State
    loading,
    missionsData,
    
    // Computed values
    currentLevel: getCurrentLevel(),
    ultimateProgress: getUltimateProgress(),
    
    // Actions
    executeMission,
    updateMissionProgress,
    claimMissionReward,
    loadMissionsData,
    getNewBadges
  };
};