import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Fab, Dialog, DialogTitle, DialogContent, TextField, Button, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { Add } from '@mui/icons-material';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { convertMultipleImages } from '../services/simpleImageService';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import CreatePostCard from '../components/CreatePostCard';
import RightSidebar from '../components/RightSidebar';
import ImageUpload from '../components/ImageUpload';
import PostSkeleton from '../components/PostSkeleton';
import LoadingSpinner from '../components/LoadingSpinner';
import { samplePosts } from '../data/samplePosts';

const Home = () => {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [firebasePosts, setFirebasePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', images: [] });
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Trồng trọt', 'Chăn nuôi', 'Thủy sản', 'Công nghệ nông nghiệp', 'Thị trường', 'Khác'];

  useEffect(() => {
    // Lấy dữ liệu từ Firebase
    let q;
    if (selectedCategory === 'Tất cả') {
      q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'posts'),
        where('category', '==', selectedCategory),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFirebasePosts(postsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [selectedCategory]);

  useEffect(() => {
    // Kết hợp dữ liệu mẫu và Firebase
    let filteredSamplePosts = samplePosts;
    if (selectedCategory !== 'Tất cả') {
      filteredSamplePosts = samplePosts.filter(post => post.category === selectedCategory);
    }
    
    // Sắp xếp theo thời gian tạo (mới nhất trước)
    const allPosts = [...filteredSamplePosts, ...firebasePosts].sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    setPosts(allPosts);
  }, [selectedCategory, firebasePosts]);

  const handleSubmit = async () => {
    if (!user || !newPost.title || !newPost.content) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrls = [];
      
      // Chuyển hình ảnh thành base64
      if (newPost.images && newPost.images.length > 0) {
        console.log('Converting images to base64:', newPost.images);
        imageUrls = await convertMultipleImages(newPost.images);
        console.log('Base64 images ready');
      }

      const postData = {
        title: newPost.title || '',
        content: newPost.content || '',
        category: newPost.category || 'Khác',
        images: imageUrls || [],
        authorId: user.uid,
        authorName: userProfile?.displayName || user.email || 'Anonymous',
        authorReputation: userProfile?.reputation || 0,
        createdAt: new Date(),
        likes: 0,
        comments: 0
      };

      console.log('Post data before save:', postData);
      console.log('User profile:', userProfile);
      
      // Kiểm tra các field undefined
      Object.keys(postData).forEach(key => {
        if (postData[key] === undefined) {
          console.error(`Field ${key} is undefined!`);
        }
      });

      await addDoc(collection(db, 'posts'), postData);

      setNewPost({ title: '', content: '', category: '', images: [] });
      setOpen(false);
    } catch (error) {
      console.error('Full error:', error);
      alert('Lỗi khi đăng bài: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Sidebar 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </Grid>
        
        <Grid item xs={12} lg={6}>
          <CreatePostCard onCreatePost={() => setOpen(true)} />
          
          <Box>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))
            ) : posts.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                Chưa có bài viết nào trong danh mục này.
              </Typography>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} lg={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <RightSidebar />
        </Grid>
      </Grid>

      {user && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setOpen(true)}
        >
          <Add />
        </Fab>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo bài viết mới</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={newPost.title}
            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nội dung"
            value={newPost.content}
            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            sx={{ mb: 2 }}
          />
          <ImageUpload 
            onImagesChange={(images) => setNewPost({...newPost, images})}
            maxFiles={5}
          />
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={submitting}
            fullWidth 
            sx={{ mt: 2 }}
          >
            {submitting ? 'Đang đăng...' : 'Đăng bài'}
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Home;