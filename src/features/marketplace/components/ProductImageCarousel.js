import React, { memo } from 'react';
import { Card, Button, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const ProductImageCarousel = ({ images, productName, onGalleryOpen }) => {
  const carouselRef = React.useRef();

  return (
    <Card style={{ marginBottom: 16 }}>
      {images && images.length > 0 ? (
        <div className="product-detail-carousel" style={{ position: 'relative', touchAction: 'pan-y' }}>
          <Carousel 
            ref={carouselRef}
            dots={true}
            infinite={true}
            autoplay={false}
            style={{ borderRadius: 8, overflow: 'hidden' }}
            dotPosition="bottom"
            lazyLoad="ondemand"
          >
            {images.map((image, index) => (
              <div key={index}>
                <div 
                  className="product-detail-image-frame"
                  style={{ 
                    background: '#f0f0f0',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={onGalleryOpen}
                >
                  <img
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      borderRadius: 8,
                      backgroundColor: '#e2e8f0',
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                    onLoad={(e) => {
                      e.target.style.opacity = 1;
                    }}
                    onError={(e) => {
                      e.target.style.opacity = 0.5;
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: 12
                  }}>
                    {index + 1}/{images.length}
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => carouselRef.current?.prev()}
                className="carousel-nav-btn"
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
                  height: 40,
                  zIndex: 10
                }}
              />
              <Button
                type="text"
                icon={<RightOutlined />}
                onClick={() => carouselRef.current?.next()}
                className="carousel-nav-btn"
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
                  height: 40,
                  zIndex: 10
                }}
              />
            </>
          )}
        </div>
      ) : (
        <div style={{ 
          minHeight: 280, 
          background: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 48,
          borderRadius: 8
        }}>
          📷
        </div>
      )}
      
      {/* Click to view all images hint */}
      {images && images.length > 1 && (
        <div 
          className="gallery-hint"
          style={{ 
            textAlign: 'center', 
            marginTop: 12, 
            padding: '8px 12px',
            background: '#f0f0f0',
            borderRadius: 6,
            cursor: 'pointer'
          }} 
          onClick={onGalleryOpen}
        >
          <span style={{ fontSize: 12, color: '#666' }}>
            👁️ Click để xem tất cả {images.length} hình ảnh
          </span>
        </div>
      )}
    </Card>
  );
};

export default memo(ProductImageCarousel);
