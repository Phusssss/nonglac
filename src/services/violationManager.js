import { reportError, addBreadcrumb } from '../utils/sentry';

class ViolationManager {
  constructor() {
    this.violations = [];
    this.sessionKey = 'protection_violations';
    this.loadViolations();
  }

  loadViolations() {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      this.violations = stored ? JSON.parse(stored) : [];
    } catch (error) {
      this.violations = [];
    }
  }

  saveViolations() {
    try {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(this.violations));
    } catch (error) {
      if (typeof reportError === 'function') {
        reportError(error, { context: 'violationManager.saveViolations' });
      }
    }
  }

  addViolation(type, metadata = {}) {
    const violation = {
      type,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      ...metadata
    };

    this.violations.push(violation);
    this.saveViolations();

    // Log to Sentry
    if (typeof addBreadcrumb === 'function') {
      addBreadcrumb(
        `Security violation: ${type}`,
        'security',
        'warning'
      );
    }

    // Report if threshold exceeded
    if (this.violations.length >= 3) {
      if (typeof reportError === 'function') {
        reportError(new Error(`Multiple security violations: ${this.violations.length}`), {
          violations: this.violations,
          type: 'security'
        });
      }
    }

    return violation;
  }

  getViolationCount() {
    return this.violations.length;
  }

  getViolations() {
    return [...this.violations];
  }

  clearViolations() {
    this.violations = [];
    try {
      sessionStorage.removeItem(this.sessionKey);
    } catch (error) {
      // Silent fail
    }
  }

  shouldRestrict(threshold = 3) {
    return this.violations.length >= threshold;
  }
}

export const violationManager = new ViolationManager();
export default violationManager;
