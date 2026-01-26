import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

export const logUserAction = async (userId, userName, action, details = {}) => {
  try {
    await addDoc(collection(db, 'userActions'), {
      userId,
      userName,
      action,
      details,
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
