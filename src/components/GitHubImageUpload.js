import React, { useState, useRef } from 'react';
import { Box, Button, Typography, LinearProgress, Alert, IconButton, Grid } from '@mui/material';
import { CloudUpload, Delete, PhotoLibrary } from '@mui/icons-material';
import { githubStorage } from '../services/githubStorage';

const GitHubImageUpload = ({ onUploadComplete, maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
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
        canvas.toBlob((blob) => {
          // Preserve original file name
          blob.name = file.name;
          resolve(blob);
        }, file.type, quality);
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
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate all files
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        return;
      }
    }

    setError('');
    
    // Create previews for all files
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setPreviews(prev => [...prev, ...newPreviews]);

    try {
      setUploading(true);
      const totalFiles = files.length;
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 0.2) / totalFiles) * 100);

        const compressedFile = await compressImage(file);
        setProgress(((i + 0.5) / totalFiles) * 100);
        
        const downloadURL = await githubStorage.uploadImage(compressedFile, 'nonglac-images');
        uploadedImages.push(downloadURL);
        setProgress(((i + 1) / totalFiles) * 100);
        
        if (typeof onUploadComplete === 'function') {
          onUploadComplete(downloadURL);
        }
      }
      
      setUploadedUrls(prev => [...prev, ...uploadedImages]);
    } catch (error) {
      setError('Lỗi upload: ' + error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeImage = (id) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
  };

  const clearAll = () => {
    setPreviews([]);
    setUploadedUrls([]);
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
        multiple
        style={{ display: 'none' }}
      />

      <Button
        variant="outlined"
        startIcon={<PhotoLibrary />}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        fullWidth
        sx={{ mb: 2 }}
      >
        Chọn ảnh ({previews.length} ảnh đã chọn)
      </Button>

      {previews.length > 0 && (
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              {previews.length} ảnh đã chọn
            </Typography>
            <Button size="small" onClick={clearAll} color="error">
              Xóa tất cả
            </Button>
          </Box>
          
          <Grid container spacing={1}>
            {previews.map((preview) => (
              <Grid item xs={6} sm={4} key={preview.id}>
                <Box position="relative">
                  <img
                    src={preview.url}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <IconButton
                    onClick={() => removeImage(preview.id)}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      width: 24,
                      height: 24,
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.8)'
                      }
                    }}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {uploading && (
        <Box mt={2}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">
            Đang upload ảnh... {Math.round(progress)}%
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

export default GitHubImageUpload;