/**
 * Post Enrichment Service
 * Lấy thông tin tác giả mới nhất từ collection users thay vì từ posts
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Lấy thông tin user từ Firestore
 * @param {string} userId - ID của user
 * @returns {Promise<{displayName: string, photoURL: string} | null>}
 */
const getUserInfo = async (userId) => {
  if (!userId) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        displayName: userData.displayName || userData.name || 'Người dùng',
        photoURL: userData.photoURL || userData.avatar || null
      };
    }
  } catch (error) {
    console.error(`Error fetching user info for ${userId}:`, error);
  }

  return null;
};

/**
 * Enrichment post data với thông tin tác giả mới nhất
 * @param {object} post - Post object từ Firestore
 * @returns {Promise<object>} Post object với thông tin tác giả cập nhật
 */
const enrichPostWithAuthorInfo = async (post) => {
  if (!post || !post.authorId) return post;

  try {
    const userInfo = await getUserInfo(post.authorId);
    if (userInfo) {
      return {
        ...post,
        authorName: userInfo.displayName,
        authorAvatar: userInfo.photoURL
      };
    }
  } catch (error) {
    console.error('Error enriching post:', error);
  }

  return post;
};

/**
 * Enrichment multiple posts
 * @param {array} posts - Array of posts
 * @returns {Promise<array>} Array of enriched posts
 */
export const enrichPostsWithAuthorInfo = async (posts) => {
  if (!Array.isArray(posts)) return posts;

  try {
    const enrichedPosts = await Promise.all(
      posts.map(post => enrichPostWithAuthorInfo(post))
    );
    return enrichedPosts;
  } catch (error) {
    console.error('Error enriching posts:', error);
    return posts;
  }
};
