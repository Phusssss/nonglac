// Temporarily disabled MUI imports - will be migrated to Ant Design
// import { Card, CardContent, TextField, Button, Box, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
// import { Send, Image } from '@mui/icons-material';
import React, { useState } from 'react';
import { Card, Input, Button, Select, Tag, Space } from 'antd';
import { SendOutlined, PictureOutlined } from '@ant-design/icons';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import GitHubImageUpload from './GitHubImageUpload';


const PostForm = ({ onPostCreated }) => {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [images, setImages] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Trồng trọt',
    'Chăn nuôi', 
    'Thủy sản',
    'Kỹ thuật',
    'Thị trường',
    'Kinh nghiệm',
    'Hỏi đáp',
    'Khác'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (imageUrl) => {
    console.log('Image uploaded:', imageUrl);
    setImages([...images, imageUrl]);
    setShowImageUpload(false);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formData.title.trim() || !formData.content.trim()) return;

    setLoading(true);
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        authorId: user.uid,
        authorName: userProfile?.displayName || user.displayName,
        authorReputation: userProfile?.reputation || 0,
        images: images,
        likes: 0,
        comments: 0,
        createdAt: new Date()
      };
      
      console.log('Post data before submit:', postData);

      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      // Update user posts count
      if (userProfile) {
        await updateDoc(doc(db, 'users', user.uid), {
          postsCount: (userProfile.postsCount || 0) + 1
        });
      }

      // Reset form
      setFormData({ title: '', content: '', category: '' });
      setImages([]);
      
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setLoading(false);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tiêu đề bài viết"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Nội dung"
            name="content"
            value={formData.content}
            onChange={handleChange}
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Danh mục"
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {images.length > 0 && (
            <Box mb={2}>
              <Box display="flex" gap={1} flexWrap="wrap">
                {images.map((image, index) => (
                  <Chip
                    key={index}
                    label={`Ảnh ${index + 1}`}
                    onDelete={() => removeImage(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {showImageUpload && (
            <Box mb={2}>
              <GitHubImageUpload onUploadComplete={handleImageUpload} />
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              startIcon={<Image />}
              onClick={() => setShowImageUpload(!showImageUpload)}
              variant="outlined"
              size="small"
            >
              {showImageUpload ? 'Ẩn' : 'Thêm ảnh'}
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? 'Đang đăng...' : 'Đăng bài'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostForm;