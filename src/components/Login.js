import React, { useState } from 'react';

function Login({ employees, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Spezielle Behandlung für Admin-Account
    if (username === 'Admin') {
      if (password === 'Admin') {
        const adminUser = employees.find(emp => emp.name === 'Admin');
        if (adminUser) {
          onLogin(adminUser);
          return;
        }
      }
      setError('Falsches Passwort für Admin-Account');
      return;
    }

    // Für andere Benutzer nur Namensvalidierung
    const employee = employees.find(emp => emp.name === username);
    if (employee) {
      onLogin(employee);
    } else {
      setError('Ungültiger Benutzername');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Mitarbeiter-Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Name eingeben"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Passwort eingeben"
            />
          </div>
          <button type="submit" className="button login-button">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 