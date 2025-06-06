import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROLES } from '../constants';

function Navigation({ currentUser, onLogout }) {
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
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          
          <li>
            <Link 
              to="/employee" 
              className={location.pathname === '/employee' ? 'active' : ''}
            >
              Mitarbeiterportal
            </Link>
          </li>
          
          {currentUser?.role === ROLES.ADMIN && (
            <li>
              <Link 
                to="/admin" 
                className={location.pathname === '/admin' ? 'active' : ''}
              >
                Verwaltung
              </Link>
            </li>
          )}
          
          <li>
            <Link 
              to="/settings" 
              className={location.pathname === '/settings' ? 'active' : ''}
            >
              Einstellungen
            </Link>
          </li>
          
          <li>
            <button onClick={onLogout} className="nav-button">
              Abmelden
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation; 