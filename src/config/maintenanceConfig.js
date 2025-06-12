// Wartungskonfiguration
export const maintenanceConfig = {
  // Logging-Einstellungen
  logging: {
    enabled: true,
    level: 'info', // 'debug' | 'info' | 'warn' | 'error'
    maxLogSize: 5 * 1024 * 1024, // 5MB
    maxLogFiles: 5
  },

  // Performance-Monitoring
  performance: {
    enabled: true,
    metrics: {
      responseTime: true,
      memoryUsage: true,
      errorRate: true
    },
    samplingRate: 0.1 // 10% der Requests
  },

  // Error-Tracking
  errorTracking: {
    enabled: true,
    maxErrors: 1000,
    errorRetentionDays: 30
  },

  // Cache-Einstellungen
  caching: {
    enabled: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    ttl: 3600 // 1 Stunde in Sekunden
  },

  // Datenbank-Wartung
  database: {
    backupInterval: 24 * 60 * 60 * 1000, // 24 Stunden
    cleanupInterval: 7 * 24 * 60 * 60 * 1000, // 7 Tage
    maxBackups: 7
  }
};

// Wartungs-Utilities
export const maintenanceUtils = {
  // Logging-Funktionen
  logger: {
    debug: (message, ...args) => {
      if (maintenanceConfig.logging.enabled && maintenanceConfig.logging.level === 'debug') {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    },
    info: (message, ...args) => {
      if (maintenanceConfig.logging.enabled && ['debug', 'info'].includes(maintenanceConfig.logging.level)) {
        console.info(`[INFO] ${message}`, ...args);
      }
    },
    warn: (message, ...args) => {
      if (maintenanceConfig.logging.enabled && ['debug', 'info', 'warn'].includes(maintenanceConfig.logging.level)) {
        console.warn(`[WARN] ${message}`, ...args);
      }
    },
    error: (message, ...args) => {
      if (maintenanceConfig.logging.enabled) {
        console.error(`[ERROR] ${message}`, ...args);
      }
    }
  },

  // Performance-Monitoring
  performance: {
    measure: (name, fn) => {
      if (!maintenanceConfig.performance.enabled) return fn();
      
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;
      
      maintenanceUtils.logger.debug(`Performance [${name}]: ${duration.toFixed(2)}ms`);
      return result;
    }
  },

  // Error-Tracking
  errorTracking: {
    track: (error, context = {}) => {
      if (!maintenanceConfig.errorTracking.enabled) return;
      
      const errorData = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      };
      
      // Hier könnte die Integration mit einem Error-Tracking-Service erfolgen
      maintenanceUtils.logger.error('Error tracked:', errorData);
    }
  },

  // Cache-Management
  cache: {
    get: (key) => {
      if (!maintenanceConfig.caching.enabled) return null;
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { value, expiry } = JSON.parse(item);
      if (expiry && expiry < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return value;
    },
    
    set: (key, value, ttl = maintenanceConfig.caching.ttl) => {
      if (!maintenanceConfig.caching.enabled) return;
      
      const item = {
        value,
        expiry: Date.now() + (ttl * 1000)
      };
      
      localStorage.setItem(key, JSON.stringify(item));
    },
    
    clear: () => {
      if (!maintenanceConfig.caching.enabled) return;
      
      // Lösche abgelaufene Cache-Einträge
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          const item = localStorage.getItem(key);
          if (item) {
            const { expiry } = JSON.parse(item);
            if (expiry && expiry < Date.now()) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    }
  }
}; 