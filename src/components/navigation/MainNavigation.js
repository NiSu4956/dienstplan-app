import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROLES } from '../../constants/roles';

/**
 * Hauptnavigation der Anwendung
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.currentUser - Aktueller Benutzer
 * @param {Function} props.onLogout - Logout-Handler
 */
const MainNavigation = memo(({ currentUser, onLogout }) => {
  const location = useLocation();
  
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          Dienstplan-App
        </div>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dienstplan
            </Link>
          </li>
          {currentUser?.role === ROLES.ADMIN && (
            <li>
              <Link 
                to="/admin" 
                className={location.pathname === '/admin' ? 'active' : ''}
              >
                Admin-Bereich
              </Link>
            </li>
          )}
          {currentUser ? (
            <>
              {currentUser.role !== ROLES.ADMIN && (
                <li>
                  <Link 
                    to="/portal" 
                    className={location.pathname === '/portal' ? 'active' : ''}
                  >
                    Mitarbeiterportal
                  </Link>
                </li>
              )}
              <li>
                <button onClick={onLogout} className="nav-button">
                  Abmelden ({currentUser.name})
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link 
                to="/login" 
                className={location.pathname === '/login' ? 'active' : ''}
              >
                Anmelden
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
});

MainNavigation.displayName = 'MainNavigation';

export default MainNavigation; 