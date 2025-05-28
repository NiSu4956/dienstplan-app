import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold">DienstplanPro</h1>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-indigo-200 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            
            {/* Desktop actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium transition-colors">
                Neu erstellen
              </button>
              <div className="relative">
                <button className="flex items-center space-x-2 text-indigo-100 hover:text-white transition-colors">
                  <span>Benutzer</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-800 font-semibold">
                    NS
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-indigo-700 px-4 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block py-2 px-3 text-white rounded-md hover:bg-indigo-500">Dashboard</Link>
            <Link to="/employees" className="block py-2 px-3 text-white rounded-md hover:bg-indigo-500">Mitarbeiter</Link>
            <Link to="/shifts" className="block py-2 px-3 text-white rounded-md hover:bg-indigo-500">Schichten</Link>
            <Link to="/settings" className="block py-2 px-3 text-white rounded-md hover:bg-indigo-500">Einstellungen</Link>
          </div>
        )}
      </header>
      
      {/* Navigation Tabs */}
      <div className="hidden md:flex border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
          <Link 
            to="/"
            className={`px-4 py-3 font-medium nav-tab ${isActive('/') ? 'text-indigo-600 active' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            Wochenübersicht
          </Link>
          <Link 
            to="/employees"
            className={`px-4 py-3 font-medium nav-tab ${isActive('/employees') ? 'text-indigo-600 active' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            Mitarbeiter
          </Link>
          <Link 
            to="/shifts"
            className={`px-4 py-3 font-medium nav-tab ${isActive('/shifts') ? 'text-indigo-600 active' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            Schichten
          </Link>
          <Link 
            to="/settings"
            className={`px-4 py-3 font-medium nav-tab ${isActive('/settings') ? 'text-indigo-600 active' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            Einstellungen
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}

export default Layout;