import React, { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { createNotification, notificationTypes } from '../../../services/notificationService';
import { Button } from '../../../components/ui';

const FollowButton = ({ targetUserId }) => {
  const { user, userProfile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !targetUserId || user.uid === targetUserId) return;

    const followDoc = doc(db, 'follows', `${user.uid}_${targetUserId}`);
    const unsubscribe = onSnapshot(followDoc, (doc) => {
      setIsFollowing(doc.exists());
    });

    return unsubscribe;
  }, [user, targetUserId]);

  const handleFollow = async () => {
    if (!user || user.uid === targetUserId) return;
    
    setLoading(true);
    try {
      const followDoc = doc(db, 'follows', `${user.uid}_${targetUserId}`);
      
      if (isFollowing) {
        await deleteDoc(followDoc);
      } else {
        await setDoc(followDoc, {
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: new Date()
        });
        
        await createNotification(
          targetUserId,
          notificationTypes.FOLLOW,
          `${userProfile?.displayName || user.email} đã theo dõi bạn`,
          user.uid
        );
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.uid === targetUserId) return null;

  return (
    <Button
      variant={isFollowing ? "secondary" : "primary"}
      size="sm"
      onClick={handleFollow}
      loading={loading}
    >
      {isFollowing ? '👤 Bỏ theo dõi' : '➕ Theo dõi'}
    </Button>
  );
};

export default FollowButton;