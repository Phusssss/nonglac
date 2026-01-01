import React, { useState } from 'react';
import { Modal, Image, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const ProductImageGallery = ({ images = [], visible, onClose, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images.length) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ maxWidth: 800 }}
      title={`Hình ảnh sản phẩm: ${productName}`}
      centered
    >
      <div style={{ position: 'relative' }}>
        <Image
          src={images[currentIndex]}
          alt={`${productName} - ${currentIndex + 1}`}
          style={{ width: '100%', maxHeight: 500, objectFit: 'contain' }}
          preview={false}
        />
        
        {images.length > 1 && (
          <>
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={prevImage}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40
              }}
            />
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={nextImage}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40
              }}
            />
          </>
        )}
        
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: 12,
          fontSize: 12
        }}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {images.length > 1 && (
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginTop: 16, 
          overflowX: 'auto',
          padding: '8px 0'
        }}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 6,
                cursor: 'pointer',
                border: index === currentIndex ? '2px solid #52c41a' : '2px solid transparent',
                flexShrink: 0
              }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ProductImageGallery;