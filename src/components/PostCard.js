import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardActions, Typography, Avatar, Box, IconButton, Chip, Divider, Button } from '@mui/material';
import { ThumbUp, Comment, Share, MoreVert } from '@mui/icons-material';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import ImageGallery from './ImageGallery';
import moment from 'moment';

const PostCard = ({ post }) => {
  const { user, updateReputation } = useAuth();
  const [likes, setLikes] = useState(post.likes || 0);
  const [userLiked, setUserLiked] = useState(false);

  const handleLike = useCallback(async () => {
    if (!user) return;
    
    const newLikes = userLiked ? likes - 1 : likes + 1;
    setLikes(newLikes);
    setUserLiked(!userLiked);
    
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        likes: increment(userLiked ? -1 : 1)
      });
      
      if (!userLiked) {
        await updateReputation(post.authorId, 1);
      }
    } catch (error) {
      // Revert on error
      setLikes(likes);
      setUserLiked(userLiked);
    }
  }, [user, userLiked, likes, post.id, post.authorId, updateReputation]);

  const getReputationColor = (reputation) => {
    if (reputation >= 100) return 'success';
    if (reputation >= 50) return 'warning';
    return 'default';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mb: 2, boxShadow: 1, '&:hover': { boxShadow: 2 } }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2, width: 48, height: 48 }}>
            {post.authorName?.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="600">
                {post.authorName}
              </Typography>
              <Chip 
                label={`${post.authorReputation || 0} uy tín`}
                size="small"
                color={getReputationColor(post.authorReputation)}
                variant="outlined"
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {moment(post.createdAt instanceof Date ? post.createdAt : post.createdAt?.toDate?.() || new Date()).fromNow()} • {post.category}
            </Typography>
          </Box>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, lineHeight: 1.3 }}>
          {post.title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {post.content}
        </Typography>
        
        <ImageGallery images={post.images} />
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ px: 2, py: 1 }}>
        <Button
          startIcon={<ThumbUp />}
          onClick={handleLike}
          color={userLiked ? 'primary' : 'inherit'}
          sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
        >
          {likes > 0 && likes}
        </Button>
        <Button
          startIcon={<Comment />}
          sx={{ textTransform: 'none', minWidth: 'auto', px: 2, color: 'text.secondary' }}
        >
          Bình luận
        </Button>
        <Button
          startIcon={<Share />}
          sx={{ textTransform: 'none', minWidth: 'auto', px: 2, color: 'text.secondary' }}
        >
          Chia sẻ
        </Button>
      </CardActions>
    </Card>
    </motion.div>
  );
};

export default React.memo(PostCard);