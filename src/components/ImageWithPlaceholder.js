import { memo } from 'react';

const ImageWithPlaceholder = memo(({ src, alt, width, height, className, style, priority = false, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      {...props}
    />
  );
});

ImageWithPlaceholder.displayName = 'ImageWithPlaceholder';

export default ImageWithPlaceholder;