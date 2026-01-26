import { USER_PROFILE_CONSTANTS } from '../constants';

export const userProfileService = {
  getReputationLevel: (reputation) => {
    const levels = USER_PROFILE_CONSTANTS.REPUTATION_LEVELS;
    if (reputation >= levels.EXPERT.min) return levels.EXPERT.label;
    if (reputation >= levels.EXPERIENCED.min) return levels.EXPERIENCED.label;
    if (reputation >= levels.ACTIVE.min) return levels.ACTIVE.label;
    if (reputation >= levels.MEMBER.min) return levels.MEMBER.label;
    return levels.NEWBIE.label;
  },

  getInitials: (displayName, email) => {
    return displayName?.charAt(0) || email?.charAt(0) || 'U';
  }
};