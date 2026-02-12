import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDevToolsDetection } from '../hooks/useDevToolsDetection';
import { useConsoleProtection } from '../hooks/useConsoleProtection';
import { useKeyboardProtection } from '../hooks/useKeyboardProtection';
import ProtectionWarningModal from '../components/ProtectionWarningModal';
import { violationManager } from '../services/violationManager';
import { protectionLogger } from '../services/protectionLogger';

const ProtectionContext = createContext(null);

export const ProtectionProvider = ({ children, config = {} }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isEnabled = config.enabled !== false && isProduction;
  
  const [state, setState] = useState({
    isActive: isEnabled,
    isDevToolsOpen: false,
    violationCount: 0,
    showWarning: false,
    restrictedMode: false
  });

  // Initialize protection hooks
  const devToolsDetection = useDevToolsDetection(isEnabled);
  useConsoleProtection(isEnabled);
  useKeyboardProtection(isEnabled);

  // Handle DevTools detection
  useEffect(() => {
    if (devToolsDetection.isOpen && !state.isDevToolsOpen) {
      handleViolation('devtools_opened');
    } else if (!devToolsDetection.isOpen && state.isDevToolsOpen) {
      // DevTools closed - auto dismiss warning after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, showWarning: false, isDevToolsOpen: false }));
      }, 2000);
    }
  }, [devToolsDetection.isOpen]);

  const handleViolation = (type) => {
    const violation = violationManager.addViolation(type);
    const newCount = violationManager.getViolationCount();
    
    setState(prev => ({
      ...prev,
      isDevToolsOpen: true,
      violationCount: newCount,
      showWarning: true,
      restrictedMode: newCount >= (config.violationThreshold || 3)
    }));

    // Log violation
    protectionLogger.logViolation(type, { count: newCount });

    // Force logout if threshold exceeded
    if (newCount >= (config.violationThreshold || 3)) {
      setTimeout(() => {
        sessionStorage.clear();
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }, 3000);
    }
  };

  const value = {
    ...state,
    config,
    handleViolation
  };

  // Log initialization in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Protection] Running in development mode - protections disabled');
    }
  }, []);

  return (
    <ProtectionContext.Provider value={value}>
      {children}
      {state.showWarning && (
        <ProtectionWarningModal
          visible={state.showWarning}
          onClose={() => setState(prev => ({ ...prev, showWarning: false }))}
          config={config}
          violationCount={state.violationCount}
        />
      )}
    </ProtectionContext.Provider>
  );
};

export const useProtection = () => {
  const context = useContext(ProtectionContext);
  if (!context) {
    throw new Error('useProtection must be used within ProtectionProvider');
  }
  return context;
};
