import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { securityConfig, securityUtils } from '../config/securityConfig';

const SecurityContext = createContext(null);

export const SecurityProvider = ({ children }) => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [csrfToken, setCsrfToken] = useState(securityUtils.generateCSRFToken());

  // Aktualisiert die letzte Aktivität
  const updateLastActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Überprüft die Session
  const checkSession = useCallback(() => {
    if (!securityUtils.isSessionValid(lastActivity)) {
      // Session ist abgelaufen
      handleLogout();
    }
  }, [lastActivity]);

  // Überprüft die Login-Versuche
  const checkLoginAttempts = useCallback(() => {
    if (loginAttempts >= securityConfig.maxLoginAttempts) {
      // Zu viele Login-Versuche
      handleLogout();
      return false;
    }
    return true;
  }, [loginAttempts]);

  // Erhöht die Login-Versuche
  const incrementLoginAttempts = useCallback(() => {
    setLoginAttempts(prev => prev + 1);
  }, []);

  // Setzt die Login-Versuche zurück
  const resetLoginAttempts = useCallback(() => {
    setLoginAttempts(0);
  }, []);

  // Generiert ein neues CSRF-Token
  const refreshCsrfToken = useCallback(() => {
    setCsrfToken(securityUtils.generateCSRFToken());
  }, []);

  // Sanitized User-Input
  const sanitizeInput = useCallback((input) => {
    return securityUtils.sanitizeHTML(input);
  }, []);

  // Überprüft die Passwortstärke
  const validatePassword = useCallback((password) => {
    return securityUtils.validatePassword(password);
  }, []);

  // Logout-Handler
  const handleLogout = useCallback(() => {
    // Hier können Sie zusätzliche Logout-Logik implementieren
    setLoginAttempts(0);
    setLastActivity(Date.now());
    refreshCsrfToken();
  }, [refreshCsrfToken]);

  // Aktivitäts-Listener
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Session-Check-Interval
    const sessionCheckInterval = setInterval(checkSession, 60000); // Jede Minute

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheckInterval);
    };
  }, [updateLastActivity, checkSession]);

  const value = {
    loginAttempts,
    csrfToken,
    checkLoginAttempts,
    incrementLoginAttempts,
    resetLoginAttempts,
    refreshCsrfToken,
    sanitizeInput,
    validatePassword,
    handleLogout
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}; 