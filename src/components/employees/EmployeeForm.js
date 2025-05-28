import React, { useState, useEffect } from 'react';

function EmployeeForm({ onSave, onCancel, employee = null }) {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Vollzeit',
    qualifications: []
  });

  const [newQualification, setNewQualification] = useState('');
  
  // Wenn ein Mitarbeiter zum Bearbeiten übergeben wurde, lade seine Daten
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        role: employee.role || 'Vollzeit',
        qualifications: employee.qualifications || []
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddQualification = (e) => {
    e.preventDefault();
    if (newQualification.trim() && !formData.qualifications.includes(newQualification.trim())) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (qualification) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qualification)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: employee?.id || Date.now(),
      ...formData
    });
  };

  const roles = [
    'Vollzeit',
    'Teilzeit',
    'Leitung',
    'Aushilfe',
    'Praktikant'
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-input-full"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="role">Rolle</label>
        <select
          id="role"
          name="role"
          className="form-select"
          value={formData.role}
          onChange={handleChange}
        >
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Qualifikationen</label>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            className="form-input"
            value={newQualification}
            onChange={(e) => setNewQualification(e.target.value)}
            placeholder="Neue Qualifikation"
          />
          <button
            type="button"
            className="button"
            onClick={handleAddQualification}
          >
            Hinzufügen
          </button>
        </div>
        
        {formData.qualifications.length > 0 && (
          <div className="employee-qualifications">
            {formData.qualifications.map((qual, index) => (
              <span key={index} className="qualification-tag">
                {qual}
                <button
                  type="button"
                  className="remove-qualification"
                  onClick={() => handleRemoveQualification(qual)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="modal-footer">
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="button">
          {employee ? 'Aktualisieren' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  );
}

export default EmployeeForm;