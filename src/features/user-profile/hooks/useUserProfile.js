import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { USER_PROFILE_CONSTANTS } from '../constants';

export const useUserProfile = (userId) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userDisplayBadgeKey, setUserDisplayBadgeKey] = useState(null);
  const [userMissionScore, setUserMissionScore] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserProfile({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(USER_PROFILE_CONSTANTS.POSTS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserPosts(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchUserDisplayBadge = async () => {
    try {
      const missionsDoc = await getDoc(doc(db, 'userMissions', userId));
      if (!missionsDoc.exists()) {
        setUserDisplayBadgeKey(null);
        setUserMissionScore(0);
        return;
      }

      const missionsData = missionsDoc.data() || {};
      const unlockedBadges = Array.isArray(missionsData.unlockedBadges) ? missionsData.unlockedBadges : [];
      const displayBadgeKey = missionsData.selectedDisplayBadge
        || missionsData.selectedProfessionBadge
        || unlockedBadges[0]
        || null;

      setUserDisplayBadgeKey(displayBadgeKey);
      setUserMissionScore(typeof missionsData.score === 'number' ? missionsData.score : 0);
    } catch (error) {
      console.error('Error fetching user display badge:', error);
      setUserDisplayBadgeKey(null);
      setUserMissionScore(0);
    }
  };

  const loadFollowStats = () => {
    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId)
    );
    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      setFollowers(snapshot.docs.length);
    });

    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );
    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      setFollowing(snapshot.docs.length);
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
      fetchUserDisplayBadge();
      const cleanup = loadFollowStats();
      return cleanup;
    }
  }, [userId]);

  return {
    userProfile,
    userDisplayBadgeKey,
    userMissionScore,
    userPosts,
    followers,
    following,
    loading
  };
};
