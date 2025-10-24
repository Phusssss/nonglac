import React, { useState } from 'react';
import { Box, ImageList, ImageListItem, Dialog, IconButton } from '@mui/material';
import { Close, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGallery = ({ images }) => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getGridCols = () => {
    if (images.length === 1) return 1;
    if (images.length === 2) return 2;
    return 3;
  };

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <ImageList 
          cols={getGridCols()} 
          gap={4}
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            maxHeight: images.length === 1 ? 400 : 300
          }}
        >
          {images.map((image, index) => (
            <ImageListItem 
              key={index}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
                transition: 'opacity 0.2s'
              }}
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image}
                alt={`Post image ${index + 1}`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { bgcolor: 'black', boxShadow: 'none' }
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 1 }}
          >
            <Close />
          </IconButton>

          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{ position: 'absolute', left: 16, color: 'white', zIndex: 1 }}
              >
                <ArrowBackIos />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{ position: 'absolute', right: 16, color: 'white', zIndex: 1 }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain'
              }}
            />
          </AnimatePresence>
        </Box>
      </Dialog>
    </>
  );
};

export default ImageGallery;