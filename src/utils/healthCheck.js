import React from 'react';
import { addBreadcrumb, reportError } from './sentry';

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  interval: 5 * 60 * 1000, // 5 minutes
  timeout: 10000, // 10 seconds
  retries: 3,
  endpoints: [
    {
      name: 'API Server',
      url: `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/health`,
      critical: true
    },
    {
      name: 'AI Service',
      url: `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/ai/health`,
      critical: false
    }
  ]
};

class HealthChecker {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.healthStatus = {};
    this.listeners = [];
  }

  // Start health monitoring
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Initial check
    this.performHealthCheck();
    
    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, HEALTH_CHECK_CONFIG.interval);
    
    addBreadcrumb('Health monitoring started', 'system', 'info');
  }

  // Stop health monitoring
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    addBreadcrumb('Health monitoring stopped', 'system', 'info');
  }

  // Perform health check on all endpoints
  async performHealthCheck() {
    const results = {};
    
    for (const endpoint of HEALTH_CHECK_CONFIG.endpoints) {
      try {
        const result = await this.checkEndpoint(endpoint);
        results[endpoint.name] = result;
      } catch (error) {
        results[endpoint.name] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
          critical: endpoint.critical
        };
      }
    }
    
    // Update health status
    this.healthStatus = {
      ...results,
      lastCheck: new Date().toISOString(),
      overallStatus: this.calculateOverallStatus(results)
    };
    
    // Notify listeners
    this.notifyListeners(this.healthStatus);
    
    // Handle unhealthy services
    this.handleUnhealthyServices(results);
    
    return this.healthStatus;
  }

  // Check individual endpoint
  async checkEndpoint(endpoint) {
    const startTime = performance.now();
    let attempt = 0;
    
    while (attempt < HEALTH_CHECK_CONFIG.retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_CONFIG.timeout);
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        const responseTime = performance.now() - startTime;
        
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          
          return {
            status: 'healthy',
            responseTime: Math.round(responseTime),
            httpStatus: response.status,
            data,
            timestamp: new Date().toISOString(),
            attempt: attempt + 1,
            critical: endpoint.critical
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (error) {
        attempt++;
        
        if (attempt >= HEALTH_CHECK_CONFIG.retries) {
          const responseTime = performance.now() - startTime;
          
          return {
            status: 'unhealthy',
            error: error.message,
            responseTime: Math.round(responseTime),
            timestamp: new Date().toISOString(),
            attempts: attempt,
            critical: endpoint.critical
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Calculate overall system status
  calculateOverallStatus(results) {
    const statuses = Object.values(results);
    
    // Check for critical service failures
    const criticalFailures = statuses.filter(s => s.critical && s.status !== 'healthy');
    if (criticalFailures.length > 0) {
      return 'critical';
    }
    
    // Check for any failures
    const failures = statuses.filter(s => s.status !== 'healthy');
    if (failures.length > 0) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  // Handle unhealthy services
  handleUnhealthyServices(results) {
    Object.entries(results).forEach(([serviceName, result]) => {
      if (result.status !== 'healthy') {
        const message = `Service ${serviceName} is ${result.status}: ${result.error || 'Unknown error'}`;
        
        addBreadcrumb(message, 'system', result.critical ? 'error' : 'warning');
        
        // Report critical service failures
        if (result.critical) {
          reportError(new Error(message), {
            service: serviceName,
            healthCheck: true,
            responseTime: result.responseTime,
            attempts: result.attempts
          });
        }
      }
    });
  }

  // Add health status listener
  addListener(callback) {
    this.listeners.push(callback);
    
    // Send current status immediately
    if (Object.keys(this.healthStatus).length > 0) {
      callback(this.healthStatus);
    }
  }

  // Remove health status listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners
  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        // Silent fail
      }
    });
  }

  // Get current health status
  getHealthStatus() {
    return this.healthStatus;
  }

  // Manual health check
  async checkNow() {
    return await this.performHealthCheck();
  }
}

// Create singleton instance
const healthChecker = new HealthChecker();

// React hook for health status
export const useHealthStatus = () => {
  const [healthStatus, setHealthStatus] = React.useState(healthChecker.getHealthStatus());
  
  React.useEffect(() => {
    const handleStatusUpdate = (status) => {
      setHealthStatus(status);
    };
    
    healthChecker.addListener(handleStatusUpdate);
    
    return () => {
      healthChecker.removeListener(handleStatusUpdate);
    };
  }, []);
  
  return healthStatus;
};

// Health status component
export const HealthStatusIndicator = ({ showDetails = false }) => {
  const healthStatus = useHealthStatus();
  
  if (!healthStatus.overallStatus) {
    return null;
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#52c41a';
      case 'degraded': return '#faad14';
      case 'critical': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  };
  
  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '4px',
      fontSize: '12px',
      color: getStatusColor(healthStatus.overallStatus)
    }}>
      <span>{getStatusIcon(healthStatus.overallStatus)}</span>
      <span style={{ textTransform: 'capitalize' }}>
        {healthStatus.overallStatus}
      </span>
      
      {showDetails && (
        <div style={{ marginLeft: '8px', fontSize: '10px', opacity: 0.7 }}>
          Last check: {new Date(healthStatus.lastCheck).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

// Initialize health monitoring
export const initHealthMonitoring = () => {
  // Disabled - no health check in production or development
};

// Stop health monitoring
export const stopHealthMonitoring = () => {
  healthChecker.stop();
};

// Manual health check
export const checkHealth = () => {
  return healthChecker.checkNow();
};

// Get current health status
export const getHealthStatus = () => {
  return healthChecker.getHealthStatus();
};

export default healthChecker;
