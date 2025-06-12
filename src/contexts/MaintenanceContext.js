import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { maintenanceConfig, maintenanceUtils } from '../config/maintenanceConfig';

const MaintenanceContext = createContext(null);

export const MaintenanceProvider = ({ children }) => {
  // Performance-Monitoring
  const trackPerformance = useCallback((name, fn) => {
    return maintenanceUtils.performance.measure(name, fn);
  }, []);

  // Error-Tracking
  const trackError = useCallback((error, context = {}) => {
    maintenanceUtils.errorTracking.track(error, context);
  }, []);

  // Logging
  const log = useCallback((level, message, ...args) => {
    maintenanceUtils.logger[level](message, ...args);
  }, []);

  // Cache-Management
  const cache = useCallback({
    get: (key) => maintenanceUtils.cache.get(key),
    set: (key, value, ttl) => maintenanceUtils.cache.set(key, value, ttl),
    clear: () => maintenanceUtils.cache.clear()
  }, []);

  // Automatische Wartungsaufgaben
  useEffect(() => {
    // Cache-Bereinigung
    const cacheCleanupInterval = setInterval(() => {
      maintenanceUtils.cache.clear();
    }, 3600000); // Stündlich

    // Performance-Monitoring
    const performanceCheckInterval = setInterval(() => {
      if (maintenanceConfig.performance.enabled) {
        const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : null;
        if (memoryUsage) {
          log('debug', `Memory Usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    }, 300000); // Alle 5 Minuten

    return () => {
      clearInterval(cacheCleanupInterval);
      clearInterval(performanceCheckInterval);
    };
  }, [log]);

  // Error Boundary
  const errorBoundary = {
    onError: (error, errorInfo) => {
      trackError(error, { componentStack: errorInfo.componentStack });
    }
  };

  const value = {
    trackPerformance,
    trackError,
    log,
    cache,
    errorBoundary
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}; 