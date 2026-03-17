import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook để lấy thông tin tác giả mới nhất từ collection users
 * @param {string} authorId - ID của tác giả
 * @param {object} fallbackData - Dữ liệu fallback từ posts collection
 * @returns {object} Thông tin tác giả (displayName, avatar, reputation)
 */
export const useAuthorInfo = (authorId, fallbackData = {}) => {
  const [authorInfo, setAuthorInfo] = useState({
    displayName: fallbackData.authorName || 'Người dùng',
    avatar: fallbackData.authorAvatar || null,
    reputation: fallbackData.authorReputation || 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!authorId) {
      setAuthorInfo(prev => ({
        ...prev,
        loading: false,
        error: 'Không có ID tác giả'
      }));
      return;
    }

    const fetchAuthorInfo = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', authorId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAuthorInfo({
            displayName: userData.displayName || fallbackData.authorName || 'Người dùng',
            avatar: userData.avatar || fallbackData.authorAvatar || null,
            reputation: userData.reputation || fallbackData.authorReputation || 0,
            loading: false,
            error: null
          });
        } else {
          // Nếu không tìm thấy user, dùng fallback data
          setAuthorInfo(prev => ({
            ...prev,
            loading: false,
            error: 'Không tìm thấy thông tin tác giả'
          }));
        }
      } catch (error) {
        console.error('Error fetching author info:', error);
        setAuthorInfo(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchAuthorInfo();
  }, [authorId, fallbackData]);

  return authorInfo;
};
