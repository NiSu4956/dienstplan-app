// Sicherheitskonfiguration
export const securityConfig = {
  // Session-Timeout in Minuten
  sessionTimeout: 30,
  
  // Maximale Anzahl an Login-Versuchen
  maxLoginAttempts: 3,
  
  // Passwort-Anforderungen
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  
  // XSS-Schutz
  xssProtection: {
    enabled: true,
    mode: 'block'
  },
  
  // CSRF-Schutz
  csrfProtection: {
    enabled: true,
    tokenHeader: 'X-CSRF-Token'
  },
  
  // Content Security Policy
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
};

// Hilfsfunktionen für Sicherheitsüberprüfungen
export const securityUtils = {
  // Überprüft die Passwortstärke
  validatePassword: (password) => {
    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = securityConfig.passwordRequirements;
    
    if (password.length < minLength) return false;
    if (requireUppercase && !/[A-Z]/.test(password)) return false;
    if (requireLowercase && !/[a-z]/.test(password)) return false;
    if (requireNumbers && !/\d/.test(password)) return false;
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
  },
  
  // Generiert ein sicheres CSRF-Token
  generateCSRFToken: () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },
  
  // Überprüft die Session-Gültigkeit
  isSessionValid: (lastActivity) => {
    const now = new Date().getTime();
    const timeout = securityConfig.sessionTimeout * 60 * 1000; // Konvertierung in Millisekunden
    return (now - lastActivity) < timeout;
  },
  
  // Sanitized HTML-Input
  sanitizeHTML: (input) => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
}; 