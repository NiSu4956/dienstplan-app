import React from 'react';
import AppRouter from './components/AppRouter';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/App.css';
import './styles/portal.css';

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;