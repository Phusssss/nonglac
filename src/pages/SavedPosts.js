import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
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
      
      // Lấy thông tin chi tiết của từng bài viết
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
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Vui lòng đăng nhập để xem bài viết đã lưu</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Bài viết đã lưu
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))
          ) : savedPosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Bạn chưa lưu bài viết nào
              </Typography>
            </Box>
          ) : (
            savedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SavedPosts;