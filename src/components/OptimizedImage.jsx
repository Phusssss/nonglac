import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from 'antd';

/**
 * OptimizedImage - Component tối ưu hóa load ảnh
 * Features: Lazy loading, Progressive loading, WebP support, Blur placeholder
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  placeholder = 'blur',
  quality = 75,
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState(null);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    // Check if browser supports WebP
    const supportsWebP = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;

    // Convert to WebP if supported and not already WebP
    let optimizedSrc = src;
    if (supportsWebP && !src.endsWith('.webp')) {
      // If using Firebase Storage or similar, append format parameter
      if (src.includes('firebasestorage.googleapis.com')) {
        optimizedSrc = `${src}?format=webp&quality=${quality}`;
      }
    }

    setImageSrc(optimizedSrc);
  }, [isInView, src, quality]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  // Blur placeholder style
  const placeholderStyle = {
    filter: isLoaded ? 'none' : 'blur(10px)',
    transition: 'filter 0.3s ease-in-out',
    ...style,
  };

  // Show skeleton while loading
  if (!isInView || !imageSrc) {
    return (
      <div
        ref={imgRef}
        style={{
          width: width || '100%',
          height: height || 'auto',
          ...style,
        }}
        className={className}
      >
        {placeholder === 'skeleton' ? (
          <Skeleton.Image active style={{ width: '100%', height: '100%' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f0f0f0',
            }}
          />
        )}
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        style={{
          width: width || '100%',
          height: height || 'auto',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          ...style,
        }}
        className={className}
      >
        <span>⚠️ Không thể tải ảnh</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={placeholderStyle}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage;
