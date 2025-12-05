import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Avatar, Divider, IconButton, Collapse } from '@mui/material';
import { Send, ThumbUp, Reply } from '@mui/icons-material';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { createNotification, notificationTypes } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const CommentSection = ({ postId, postAuthorId, onCommentCountChange }) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
      onCommentCountChange?.(commentsData.length);
    });

    return unsubscribe;
  }, [postId, onCommentCountChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        content: newComment.trim(),
        authorId: user.uid,
        authorName: userProfile?.displayName || user.email,
        authorAvatar: userProfile?.avatar || null,
        authorReputation: userProfile?.reputation || 0,
        createdAt: new Date(),
        likes: 0,
        parentId: null
      });

      // Chỉ cập nhật số comment cho bài viết Firebase (không phải sample data)
      if (postId && !postId.toString().match(/^[0-9]+$/)) {
        await updateDoc(doc(db, 'posts', postId), {
          comments: increment(1)
        });
      }

      // Tạo thông báo cho tác giả bài viết
      if (postAuthorId && postAuthorId !== user.uid) {
        await createNotification(
          postAuthorId,
          notificationTypes.COMMENT,
          `${userProfile?.displayName || user.email} đã bình luận bài viết của bạn`,
          postId
        );
      }

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId, currentLikes) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  const handleReply = async (parentCommentId) => {
    if (!user || !replyText.trim()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        content: replyText.trim(),
        authorId: user.uid,
        authorName: userProfile?.displayName || user.email,
        authorAvatar: userProfile?.avatar || null,
        authorReputation: userProfile?.reputation || 0,
        createdAt: new Date(),
        likes: 0,
        parentId: parentCommentId
      });
      
      // Tạo thông báo cho người được reply
      const parentComment = comments.find(c => c.id === parentCommentId);
      if (parentComment && parentComment.authorId !== user.uid) {
        await createNotification(
          parentComment.authorId,
          notificationTypes.COMMENT,
          `${userProfile?.displayName || user.email} đã trả lời bình luận của bạn`,
          postId
        );
      }
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getParentComments = () => {
    return comments.filter(comment => !comment.parentId);
  };
  
  const getReplies = (parentId) => {
    return comments.filter(comment => comment.parentId === parentId);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Bình luận ({comments.length})
      </Typography>

      {user && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar 
              sx={{ width: 32, height: 32 }}
              src={userProfile?.avatar}
            >
              {!userProfile?.avatar && (userProfile?.displayName?.charAt(0) || user.email?.charAt(0))}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={loading || !newComment.trim()}
                startIcon={<Send />}
                sx={{ mt: 1 }}
              >
                Gửi
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Box>
        {getParentComments().map((comment) => (
          <Box key={comment.id}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar 
                sx={{ width: 32, height: 32 }}
                src={comment.authorAvatar}
              >
                {!comment.authorAvatar && comment.authorName?.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ 
                  backgroundColor: '#F0F2F5', 
                  borderRadius: '18px', 
                  p: 2,
                  mb: 1
                }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="600"
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                    }}
                    onClick={() => navigate(`/user/${comment.authorId}`)}
                  >
                    {comment.authorName}
                  </Typography>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {moment(comment.createdAt?.toDate()).fromNow()}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleLikeComment(comment.id, comment.likes)}
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                  {comment.likes > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {comment.likes}
                    </Typography>
                  )}
                  {user && (
                    <Button
                      size="small"
                      startIcon={<Reply fontSize="small" />}
                      onClick={() => setReplyingTo(comment.id)}
                      sx={{ textTransform: 'none', minHeight: 'auto', p: 0.5 }}
                    >
                      Trả lời
                    </Button>
                  )}
                </Box>
                
                {/* Reply form */}
                <Collapse in={replyingTo === comment.id}>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Avatar 
                      sx={{ width: 24, height: 24 }}
                      src={userProfile?.avatar}
                    >
                      {!userProfile?.avatar && (userProfile?.displayName?.charAt(0) || user?.email?.charAt(0))}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Viết phản hồi..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        multiline
                        rows={2}
                      />
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyText.trim() || loading}
                        >
                          Gửi
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Hủy
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Collapse>
                
                {/* Replies */}
                {getReplies(comment.id).map((reply) => (
                  <Box key={reply.id} sx={{ ml: 4, mt: 2, display: 'flex', gap: 2 }}>
                    <Avatar 
                      sx={{ width: 28, height: 28 }}
                      src={reply.authorAvatar}
                    >
                      {!reply.authorAvatar && reply.authorName?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ 
                        backgroundColor: '#F0F2F5', 
                        borderRadius: '18px', 
                        p: 1.5,
                        mb: 1
                      }}>
                        <Typography 
                          variant="subtitle2" 
                          fontWeight="600" 
                          sx={{ 
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                          }}
                          onClick={() => navigate(`/user/${reply.authorId}`)}
                        >
                          {reply.authorName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          {reply.content}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {moment(reply.createdAt?.toDate()).fromNow()}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleLikeComment(reply.id, reply.likes)}
                          sx={{ p: 0.5 }}
                        >
                          <ThumbUp sx={{ fontSize: '0.8rem' }} />
                        </IconButton>
                        {reply.likes > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {reply.likes}
                          </Typography>
                        )}
                        {user && (
                          <Button
                            size="small"
                            startIcon={<Reply sx={{ fontSize: '0.7rem' }} />}
                            onClick={() => setReplyingTo(comment.id)}
                            sx={{ 
                              textTransform: 'none', 
                              minHeight: 'auto', 
                              p: 0.3,
                              fontSize: '0.7rem'
                            }}
                          >
                            Trả lời
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CommentSection;