import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton, Paper, Grid } from '@mui/material';
import { CloudUpload, Delete, Image } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ImageUpload = ({ onImagesChange, maxFiles = 5 }) => {
  const [images, setImages] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    const updatedImages = [...images, ...newImages].slice(0, maxFiles);
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
  }, [images, maxFiles, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: maxFiles - images.length
  });

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
  };

  return (
    <Box>
      {images.length < maxFiles && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'primary.50' : 'grey.50',
            cursor: 'pointer',
            textAlign: 'center',
            mb: 2,
            transition: 'all 0.2s'
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            {isDragActive ? 'Thả hình ảnh vào đây' : 'Kéo thả hoặc click để chọn hình'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tối đa {maxFiles} hình ảnh (JPG, PNG, GIF)
          </Typography>
        </Paper>
      )}

      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    overflow: 'hidden',
                    borderRadius: 2
                  }}
                >
                  <img
                    src={image.preview}
                    alt={`Preview ${index}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <IconButton
                    onClick={() => removeImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                    size="small"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageUpload;