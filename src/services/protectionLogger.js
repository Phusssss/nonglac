import { reportError, addBreadcrumb } from '../utils/sentry';

class ProtectionLogger {
  constructor() {
    this.db = null;
  }

  initialize(firebaseApp) {
    try {
      const { getFirestore } = require('firebase/firestore');
      this.db = getFirestore(firebaseApp);
    } catch (error) {
      // Firebase not available
    }
  }

  async logViolation(type, metadata = {}) {
    const logEntry = {
      type,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      ...metadata
    };

    // Log to Sentry
    if (typeof addBreadcrumb === 'function') {
      addBreadcrumb(
        `Protection violation: ${type}`,
        'security',
        'warning'
      );
    }

    // Log to Firebase
    if (this.db) {
      try {
        const { collection, addDoc } = require('firebase/firestore');
        await addDoc(collection(this.db, 'security_violations'), logEntry);
      } catch (error) {
        if (typeof reportError === 'function') {
          reportError(error, { context: 'protectionLogger.logViolation' });
        }
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Protection]', type, logEntry);
    }

    return logEntry;
  }

  async logEvent(eventType, data = {}) {
    const logEntry = {
      eventType,
      timestamp: Date.now(),
      ...data
    };

    if (typeof addBreadcrumb === 'function') {
      addBreadcrumb(
        `Protection event: ${eventType}`,
        'security',
        'info'
      );
    }

    if (this.db) {
      try {
        const { collection, addDoc } = require('firebase/firestore');
        await addDoc(collection(this.db, 'security_events'), logEntry);
      } catch (error) {
        // Fail silently
      }
    }

    return logEntry;
  }
}

export const protectionLogger = new ProtectionLogger();
export default protectionLogger;
