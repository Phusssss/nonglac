// Temporarily disabled MUI imports - will be migrated to Ant Design
// import { Box, ImageList, ImageListItem, Dialog, IconButton } from '@mui/material';
// import { Close, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const ImageGallery = ({ images }) => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;
  
  // Chỉ hiển thị ảnh URL, loại bỏ base64
  const validImages = images.filter(image => 
    typeof image === 'string' && 
    (image.startsWith('http') || image.startsWith('https'))
  );
  
  if (validImages.length === 0) return null;

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const getGridCols = () => {
    if (validImages.length === 1) return 1;
    if (validImages.length === 2) return 2;
    return 3;
  };

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
          gap: '8px',
          borderRadius: '8px',
          overflow: 'hidden',
          maxHeight: validImages.length === 1 ? '300px' : '250px'
        }}>
          {validImages.map((image, index) => (
            <div 
              key={index}
              style={{ 
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onClick={() => handleImageClick(index)}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              <img
                src={image}
                alt={`Post ${index + 1}`}
                style={{
                  width: '100%',
                  height: validImages.length === 1 ? 'auto' : '200px',
                  objectFit: validImages.length === 1 ? 'contain' : 'cover',
                  maxHeight: validImages.length === 1 ? '500px' : '200px'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        styles={{ 
          body: {
            backgroundColor: 'black', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '80vh',
            position: 'relative'
          }
        }}
      >
        {validImages.length > 1 && (
          <>
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={handlePrev}
              style={{ 
                position: 'absolute', 
                left: 16, 
                color: 'white', 
                zIndex: 1,
                border: 'none',
                boxShadow: 'none'
              }}
            />
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={handleNext}
              style={{ 
                position: 'absolute', 
                right: 16, 
                color: 'white', 
                zIndex: 1,
                border: 'none',
                boxShadow: 'none'
              }}
            />
          </>
        )}

        <img
          src={validImages[currentIndex]}
          alt={`Gallery ${currentIndex + 1}`}
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain'
          }}
        />
      </Modal>
    </>
  );
};

export default ImageGallery;