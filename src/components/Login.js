import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login({ onLogin, employees }) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setError('Bitte wählen Sie einen Mitarbeiter aus.');
      return;
    }

    const employee = employees.find(emp => emp.name === selectedEmployee);
    if (employee) {
      onLogin(employee);
    } else {
      setError('Mitarbeiter nicht gefunden.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Anmeldung</h2>
        <div className="form-group">
          <label htmlFor="employee">Mitarbeiter:</label>
          <select
            id="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="form-control"
          >
            <option value="">Bitte wählen...</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.name}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="login-button">Anmelden</button>
      </form>
    </div>
  );
}

export default Login; 