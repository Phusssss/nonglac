import { useEffect, useRef } from 'react';
import { reportError } from '../utils/sentry';

export const useConsoleProtection = (enabled = true) => {
  const originalConsole = useRef({});

  useEffect(() => {
    if (!enabled) return;

    // Store original console methods
    originalConsole.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      table: console.table,
      trace: console.trace,
      dir: console.dir,
      dirxml: console.dirxml,
      group: console.group,
      groupCollapsed: console.groupCollapsed,
      groupEnd: console.groupEnd,
      clear: console.clear
    };

    // Override console methods with no-op
    const noop = () => {};
    
    console.log = noop;
    console.warn = noop;
    console.info = noop;
    console.debug = noop;
    console.table = noop;
    console.trace = noop;
    console.dir = noop;
    console.dirxml = noop;
    console.group = noop;
    console.groupCollapsed = noop;
    console.groupEnd = noop;
    console.clear = noop;

    // Keep console.error for error boundaries, but redirect to Sentry
    console.error = (...args) => {
      if (typeof reportError === 'function') {
        reportError(new Error(args.join(' ')), { source: 'console.error' });
      }
    };

    // Cleanup: restore original console
    return () => {
      Object.keys(originalConsole.current).forEach(method => {
        console[method] = originalConsole.current[method];
      });
    };
  }, [enabled]);

  return { enabled };
};
