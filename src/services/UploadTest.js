import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import GitHubUploadTester from '../components/GitHubUploadTester';

const UploadTest = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        GitHub Upload Test Tool
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tool này giúp test khả năng upload file lên GitHub repository và đo lường hiệu suất.
      </Typography>
      
      <GitHubUploadTester />
      
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Hướng dẫn sử dụng:</Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>Chọn một hoặc nhiều file ảnh để test</li>
            <li>Tool sẽ upload từng file và đo thời gian, tốc độ</li>
            <li>Xem thống kê tổng quan và chi tiết từng file</li>
            <li>Kiểm tra giới hạn dung lượng và tốc độ upload</li>
          </ul>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Lưu ý:</Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>GitHub có giới hạn file tối đa 100MB</li>
            <li>Repository có giới hạn 1GB</li>
            <li>Tốc độ upload phụ thuộc vào kết nối mạng</li>
            <li>File test sẽ được lưu trong folder "test-uploads"</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};

export default UploadTest;