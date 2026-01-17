// Temporarily disabled MUI imports - will be migrated to Ant Design  
// import { Box, Button, Typography, LinearProgress, Alert, IconButton } from '@mui/material';
// import { CloudUpload, Delete } from '@mui/icons-material';
import React, { useState, useRef } from 'react';
import { Button, Typography, Progress, Alert, Space } from 'antd';
import { CloudUploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { githubStorage } from '../services/githubStorage';

const ImageUpload = ({ onUploadComplete, maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      return 'Định dạng file không được hỗ trợ';
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File quá lớn. Tối đa ${maxSize}MB`;
    }
    return null;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      setProgress(20);

      const compressedFile = await compressImage(file);
      setProgress(50);
      
      setProgress(80);
      const downloadURL = await githubStorage.uploadImage(compressedFile, 'nonglac-images');
      
      setProgress(100);
      if (onUploadComplete) {
        onUploadComplete(downloadURL);
      }
    } catch (error) {
      setError('Lỗi upload: ' + error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={allowedTypes.join(',')}
        style={{ display: 'none' }}
      />

      {!preview ? (
        <Button
          variant="outlined"
          startIcon={<CloudUpload />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          fullWidth
        >
          Chọn ảnh
        </Button>
      ) : (
        <Box>
          <Box position="relative" mb={2}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
            <IconButton
              onClick={clearPreview}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white'
              }}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      )}

      {uploading && (
        <Box mt={2}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">
            Đang upload... {progress}%
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;