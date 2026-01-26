/**
 * useIntersectionObserver Hook
 * 
 * Custom hook for implementing Intersection Observer API
 * Used for lazy loading and viewport detection
 */

import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false,
    skip = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element || skip) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        setInView(isIntersecting);
        setEntry(entry);

        if (isIntersecting && triggerOnce) {
          observer.disconnect();
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce, skip]);

  return [elementRef, inView, entry];
};

export default useIntersectionObserver;