import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

const SaveButton = ({ postId }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !postId) return;

    const saveDoc = doc(db, 'savedPosts', `${user.uid}_${postId}`);
    const unsubscribe = onSnapshot(saveDoc, (doc) => {
      setIsSaved(doc.exists());
    });

    return unsubscribe;
  }, [user, postId]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const saveDoc = doc(db, 'savedPosts', `${user.uid}_${postId}`);
      
      if (isSaved) {
        await deleteDoc(saveDoc);
      } else {
        await setDoc(saveDoc, {
          userId: user.uid,
          postId: postId,
          savedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
      aria-label={isSaved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
    >
      <Bookmark 
        className={`w-4 h-4 transition-all ${isSaved ? 'fill-[#4CAF50] text-[#4CAF50]' : 'text-gray-500'}`}
      />
    </button>
  );
};

export default SaveButton;