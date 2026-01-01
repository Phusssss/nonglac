import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';

const SavedPosts = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'savedPosts'),
      where('userId', '==', user.uid),
      orderBy('savedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const savedData = snapshot.docs.map(doc => doc.data());
      
      const posts = await Promise.all(
        savedData.map(async (save) => {
          const postDoc = await getDoc(doc(db, 'posts', save.postId));
          if (postDoc.exists()) {
            return { id: postDoc.id, ...postDoc.data() };
          }
          return null;
        })
      );
      
      setSavedPosts(posts.filter(post => post !== null));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Vui lòng đăng nhập để xem bài viết đã lưu</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-[#795548] mb-6">Bài viết đã lưu</h1>
        
        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))
          ) : savedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Bạn chưa lưu bài viết nào</p>
            </div>
          ) : (
            savedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedPosts;