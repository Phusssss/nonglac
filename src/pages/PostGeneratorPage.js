import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import PostGenerator from '../components/PostGenerator';

const PostGeneratorPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Post Generator Tool
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tool tạo bài viết mẫu với nội dung chất lượng cao cho các danh mục nông nghiệp.
      </Typography>
      
      <PostGenerator />
      
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Hướng dẫn sử dụng:</Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li>Chọn số lượng bài viết muốn tạo (1-20)</li>
            <li>Chọn danh mục cụ thể hoặc để "Ngẫu nhiên"</li>
            <li>Bấm "Tạo bài viết" và chờ hoàn thành</li>
            <li>Các bài viết sẽ xuất hiện trên trang chủ</li>
          </ol>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Nội dung bao gồm:</Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li><strong>Trồng trọt:</strong> Kỹ thuật trồng lúa, rau sạch, ghép cây ăn quả</li>
            <li><strong>Chăn nuôi:</strong> Nuôi gà thả vườn, heo sạch VietGAP</li>
            <li><strong>Thủy sản:</strong> Nuôi cá tra, tôm thẻ công nghệ cao</li>
            <li><strong>Kỹ thuật:</strong> IoT, công nghệ hiện đại</li>
            <li><strong>Thị trường:</strong> Phân tích giá cả, xu hướng</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};

export default PostGeneratorPage;