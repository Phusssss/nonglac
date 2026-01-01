import { memo } from 'react';

const OptimizedImage = memo(({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
  ...props 
}) => {
  // Generate WebP srcset for different screen sizes
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc.includes('raw.githubusercontent.com')) return '';
    
    const baseUrl = baseSrc.split('?')[0];
    return `${baseUrl}?w=400 400w, ${baseUrl}?w=800 800w, ${baseUrl}?w=1200 1200w`;
  };

  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
      style={{ aspectRatio: `${width}/${height}` }}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;