import { useState, useEffect, useRef } from 'react';

export const useDevToolsDetection = (enabled = true) => {
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef(null);
  const thresholdRef = useRef(160);

  useEffect(() => {
    if (!enabled) return;

    const detectDevTools = () => {
      // Technique 1: Window size detection
      const widthThreshold = window.outerWidth - window.innerWidth > thresholdRef.current;
      const heightThreshold = window.outerHeight - window.innerHeight > thresholdRef.current;

      // Technique 2: DevTools detection via console
      const devtoolsDetector = /./;
      devtoolsDetector.toString = function() {
        setIsOpen(true);
        return 'devtools';
      };

      // Technique 3: Debugger check
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      const timeDiff = end - start;

      // Combine techniques
      const detected = widthThreshold || heightThreshold || timeDiff > 100;
      
      if (detected !== isOpen) {
        setIsOpen(detected);
      }
    };

    // Run detection every 500ms
    intervalRef.current = setInterval(detectDevTools, 500);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, isOpen]);

  return { isOpen, enabled };
};
