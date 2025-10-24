import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Avatar, Box, Grid, Card, CardContent, Chip } from '@mui/material';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { user, userProfile } = useAuth();
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserPosts(posts);
    });

    return unsubscribe;
  }, [user]);

  if (!user) return null;

  const getReputationLevel = (reputation) => {
    if (reputation >= 1000) return 'Chuyên gia';
    if (reputation >= 500) return 'Người có kinh nghiệm';
    if (reputation >= 100) return 'Thành viên tích cực';
    if (reputation >= 50) return 'Thành viên';
    return 'Người mới';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 3, textAlign: { xs: 'center', sm: 'left' } }}>
          <Avatar sx={{ width: 80, height: 80, mr: { sm: 3 }, mb: { xs: 2, sm: 0 }, fontSize: '2rem' }}>
            {userProfile?.displayName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4">
              {userProfile?.displayName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={getReputationLevel(userProfile?.reputation || 0)}
                color="primary"
                sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}
              />
              <Chip 
                label={`${userProfile?.reputation || 0} điểm uy tín`}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {userPosts.length}
                </Typography>
                <Typography variant="body2">
                  Bài viết
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {userProfile?.likesReceived || 0}
                </Typography>
                <Typography variant="body2">
                  Lượt thích
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {userProfile?.reputation || 0}
                </Typography>
                <Typography variant="body2">
                  Uy tín
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Bài viết của tôi
      </Typography>
      
      {userPosts.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Bạn chưa có bài viết nào. Hãy đăng bài viết đầu tiên!
        </Typography>
      ) : (
        userPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </Container>
  );
};

export default Profile;