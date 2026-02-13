import React, { Suspense } from 'react';
import { Spin } from 'antd';

/**
 * LazyComponent - Wrapper for lazy-loaded components with better UX
 */
const LazyComponent = ({ 
  component: Component, 
  fallback = null,
  minLoadTime = 300, // Minimum loading time to avoid flash
  ...props 
}) => {
  const [showFallback, setShowFallback] = React.useState(false);
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    // Show fallback after minLoadTime to avoid flash for fast loads
    timeoutRef.current = setTimeout(() => {
      setShowFallback(true);
    }, minLoadTime);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [minLoadTime]);

  const defaultFallback = (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px' 
    }}>
      {showFallback && <Spin size="large" />}
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  );
};

export default LazyComponent;
