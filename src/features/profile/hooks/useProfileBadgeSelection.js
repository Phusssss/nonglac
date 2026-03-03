import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { missionsService } from '../../missions/services';
import { MISSIONS_CONSTANTS } from '../../missions/constants';

export const useProfileBadgeSelection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableBadgeIds, setAvailableBadgeIds] = useState([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState(null);

  const loadBadgeData = useCallback(async () => {
    if (!user?.uid) {
      setAvailableBadgeIds([]);
      setSelectedBadgeId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await missionsService.getUserMissionsData(user.uid);
      if (!result.success) return;

      const data = result.data;
      const available = missionsService.getAvailableProfileBadges(data);
      const selected = data.selectedDisplayBadge
        || data.selectedProfessionBadge
        || (available.length > 0 ? available[0] : null);

      setAvailableBadgeIds(available);
      setSelectedBadgeId(selected);
    } catch (error) {
      console.error('Error loading profile badges:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const updateSelectedBadge = useCallback(async (badgeId) => {
    if (!user?.uid) return { success: false, error: 'Chưa đăng nhập' };

    setSaving(true);
    try {
      const nextBadgeId = badgeId || null;
      const result = await missionsService.setProfileDisplayBadge(user.uid, nextBadgeId);
      if (result.success) {
        setSelectedBadgeId(nextBadgeId);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadBadgeData();
  }, [loadBadgeData]);

  const availableBadges = availableBadgeIds
    .map((badgeId) => ({
      ...MISSIONS_CONSTANTS.BADGES[badgeId],
      badgeKey: badgeId
    }))
    .filter((badge) => !!badge.badgeKey);

  const selectedBadge = selectedBadgeId
    ? { ...MISSIONS_CONSTANTS.BADGES[selectedBadgeId], badgeKey: selectedBadgeId }
    : null;

  return {
    loading,
    saving,
    selectedBadgeId,
    selectedBadge,
    availableBadges,
    reloadBadgeData: loadBadgeData,
    updateSelectedBadge
  };
};
