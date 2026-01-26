// Home feature hooks
import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { HOME_CONSTANTS } from '../constants';

// Custom hook for managing home posts
export const useHomePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  const loadPosts = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(HOME_CONSTANTS.POSTS_PER_PAGE)
      );

      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(HOME_CONSTANTS.POSTS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === HOME_CONSTANTS.POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [lastDoc]);

  const refreshPosts = useCallback(() => {
    setLastDoc(null);
    loadPosts(false);
  }, [loadPosts]);

  const loadMorePosts = useCallback(() => {
    if (hasMore && !loading) {
      loadPosts(true);
    }
  }, [hasMore, loading, loadPosts]);

  return {
    posts,
    loading,
    hasMore,
    refreshPosts,
    loadMorePosts
  };
};

// Custom hook for search functionality
export const useHomeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      // Simple search implementation - can be enhanced with full-text search
      const q = query(
        collection(db, 'posts'),
        where('title', '>=', query),
        where('title', '<=', query + '\uf8ff'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    performSearch
  };
};