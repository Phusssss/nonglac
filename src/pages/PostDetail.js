import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, IconButton, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <PostSkeleton />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="h6">Không tìm thấy bài viết</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">Chi tiết bài viết</Typography>
      </Box>
      
      <PostCard post={post} isDetailView={true} />
    </Container>
  );
};

export default PostDetail;