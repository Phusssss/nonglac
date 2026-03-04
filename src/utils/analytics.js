import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

const normalizeLogArgs = (arg1, arg2, arg3, arg4) => {
  // New signature: (userId, userName, action, details)
  if (typeof arg3 === 'string') {
    return {
      userId: arg1 || null,
      userName: arg2 || 'Unknown',
      action: arg3,
      details: arg4 || {}
    };
  }

  // Backward-compat signature: (action, details)
  if (typeof arg1 === 'string' && typeof arg2 === 'object') {
    return {
      userId: null,
      userName: 'Unknown',
      action: arg1,
      details: arg2 || {}
    };
  }

  return {
    userId: null,
    userName: 'Unknown',
    action: null,
    details: {}
  };
};

export const logUserAction = async (arg1, arg2, arg3, arg4) => {
  const payload = normalizeLogArgs(arg1, arg2, arg3, arg4);
  if (!payload.action) return;

  try {
    await addDoc(collection(db, 'userActions'), {
      userId: payload.userId,
      userName: payload.userName,
      action: payload.action,
      details: payload.details,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

// Action types
export const ACTIONS = {
  VIEW_POST: 'view_post',
  LIKE_POST: 'like_post',
  COMMENT_POST: 'comment_post',
  CREATE_POST: 'create_post',
  VIEW_PRODUCT: 'view_product',
  VIEW_PRICE: 'view_price',
  SEARCH: 'search',
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW_PROFILE: 'view_profile',
  FOLLOW_USER: 'follow_user'
};
