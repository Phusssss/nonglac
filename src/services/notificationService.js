import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createNotification = async (userId, type, message, relatedId = null) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      message,
      relatedId,
      read: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const notificationTypes = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  POST: 'post'
};