import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { PROFILE_CONSTANTS } from '../constants';

export const useProfile = () => {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [missionScore, setMissionScore] = useState(0);

  const loadInitialPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(PROFILE_CONSTANTS.POSTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserPosts(posts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PROFILE_CONSTANTS.POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMorePosts = async () => {
    if (!hasMore || loadingMore || !lastDoc || !user) return;
    
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PROFILE_CONSTANTS.POSTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (newPosts.length > 0) {
        setUserPosts(prev => [...prev, ...newPosts]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(newPosts.length === PROFILE_CONSTANTS.POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInitialPosts();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', user.uid)
    );
    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      setFollowers(snapshot.docs.length);
    });

    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', user.uid)
    );
    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      setFollowing(snapshot.docs.length);
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [user]);

  useEffect(() => {
    if (!user?.uid) {
      setMissionScore(0);
      return undefined;
    }

    const missionDocRef = doc(db, 'userMissions', user.uid);
    const unsubscribeMissionScore = onSnapshot(missionDocRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMissionScore(0);
        return;
      }

      const data = snapshot.data() || {};
      setMissionScore(typeof data.score === 'number' ? data.score : 0);
    });

    return () => unsubscribeMissionScore();
  }, [user?.uid]);

  return {
    userPosts,
    loading,
    loadingMore,
    hasMore,
    followers,
    following,
    missionScore,
    loadMorePosts
  };
};
