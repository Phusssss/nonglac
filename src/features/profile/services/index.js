import { PROFILE_CONSTANTS } from '../constants';

export const profileService = {
  getReputationLevel: (reputation) => {
    const levels = PROFILE_CONSTANTS.REPUTATION_LEVELS;
    if (reputation >= levels.EXPERT.min) return levels.EXPERT.label;
    if (reputation >= levels.EXPERIENCED.min) return levels.EXPERIENCED.label;
    if (reputation >= levels.ACTIVE.min) return levels.ACTIVE.label;
    if (reputation >= levels.MEMBER.min) return levels.MEMBER.label;
    return levels.NEWBIE.label;
  },

  throttle: (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  },

  getInitials: (displayName, email) => {
    return displayName?.charAt(0) || email?.charAt(0) || 'U';
  }
};