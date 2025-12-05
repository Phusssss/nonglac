import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Bookmark, BookmarkBorder } from '@mui/icons-material';
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
    <IconButton
      onClick={handleSave}
      disabled={loading}
      sx={{ color: isSaved ? 'primary.main' : 'text.secondary' }}
    >
      {isSaved ? <Bookmark /> : <BookmarkBorder />}
    </IconButton>
  );
};

export default SaveButton;