import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { PROFILE_CONSTANTS } from '../constants';

export const useSharedPosts = () => {
  const { user } = useAuth();
  const [sharedPosts, setSharedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  const loadInitialSharedPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'userPostShares'),
        where('sharedByUserId', '==', user.uid),
        orderBy('sharedAt', 'desc'),
        limit(PROFILE_CONSTANTS.POSTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSharedPosts(posts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PROFILE_CONSTANTS.POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading shared posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreSharedPosts = async () => {
    if (!hasMore || loadingMore || !lastDoc || !user) return;
    
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'userPostShares'),
        where('sharedByUserId', '==', user.uid),
        orderBy('sharedAt', 'desc'),
        startAfter(lastDoc),
        limit(PROFILE_CONSTANTS.POSTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (newPosts.length > 0) {
        setSharedPosts(prev => [...prev, ...newPosts]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(newPosts.length === PROFILE_CONSTANTS.POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more shared posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInitialSharedPosts();
    }
  }, [user]);

  return {
    sharedPosts,
    loading,
    loadingMore,
    hasMore,
    loadMoreSharedPosts
  };
};
