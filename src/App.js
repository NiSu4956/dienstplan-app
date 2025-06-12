import React from 'react';
import AppRouter from './components/AppRouter';
import { AppProvider } from './contexts/AppContext';
import './styles/app.css';
import './styles/portal.css';

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;