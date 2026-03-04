// Home feature services
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { logUserAction, ACTIONS } from '../../../utils/analytics';

export const homeService = {
  // Create a new post
  async createPost(postData, userId) {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        authorId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        shares: 0
      });

      // Log analytics
      logUserAction(userId, 'Unknown', ACTIONS.CREATE_POST, { postId: docRef.id });

      return { success: true, postId: docRef.id };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  },

  // Update post
  async updatePost(postId, updateData) {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating post:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete post
  async deletePost(postId) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  },

  // Like/Unlike post
  async toggleLike(postId, userId, isLiked) {
    try {
      const postRef = doc(db, 'posts', postId);
      const likeRef = doc(db, 'likes', `${userId}_${postId}`);

      if (isLiked) {
        // Remove like
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likes: increment(-1)
        });
      } else {
        // Add like
        await addDoc(collection(db, 'likes'), {
          userId,
          postId,
          createdAt: serverTimestamp()
        });
        await updateDoc(postRef, {
          likes: increment(1)
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  }
};
