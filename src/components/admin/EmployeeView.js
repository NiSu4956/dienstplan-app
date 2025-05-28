import React, { useState } from 'react';
import Modal from '../common/Modal';

function EmployeeView({ employees, setEmployees }) {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Vollzeit',
    qualifications: []
  });
  const [newQualification, setNewQualification] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingEmployee) {
      // Bearbeite existierenden Mitarbeiter
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData }
          : emp
      ));
    } else {
      // Füge neuen Mitarbeiter hinzu
      setEmployees(prev => [...prev, {
        id: Date.now(),
        ...formData
      }]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (employeeId) => {
    if (!window.confirm('Möchten Sie diesen Mitarbeiter wirklich löschen?')) return;
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      qualifications: [...employee.qualifications]
    });
    setShowModal(true);
  };

  const handleAddQualification = () => {
    if (!newQualification.trim()) return;
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, newQualification.trim()]
    }));
    setNewQualification('');
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: 'Vollzeit',
      qualifications: []
    });
  };

  return (
    <div>
      <div className="view-header">
        <h3>Mitarbeiter verwalten</h3>
        <button className="button" onClick={() => setShowModal(true)}>
          Mitarbeiter hinzufügen
        </button>
      </div>

      <div className="employee-list">
        {employees.map(employee => (
          <div key={employee.id} className="employee-card">
            <div className="employee-info">
              <div className="employee-name">{employee.name}</div>
              <div className="employee-role">{employee.role}</div>
              <div className="employee-qualifications">
                {employee.qualifications.map((qual, index) => (
                  <span key={index} className="qualification-tag">
                    {qual}
                  </span>
                ))}
              </div>
            </div>
            <div className="employee-actions">
              <button 
                className="button secondary"
                onClick={() => handleEdit(employee)}
              >
                Bearbeiten
              </button>
              <button 
                className="button secondary"
                onClick={() => handleDelete(employee.id)}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingEmployee ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Position</label>
            <select
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="form-select"
            >
              <option value="Vollzeit">Vollzeit</option>
              <option value="Teilzeit">Teilzeit</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Qualifikationen</label>
            <div className="qualification-input">
              <input
                type="text"
                value={newQualification}
                onChange={e => setNewQualification(e.target.value)}
                className="form-input"
                placeholder="Neue Qualifikation"
              />
              <button
                type="button"
                className="button"
                onClick={handleAddQualification}
              >
                +
              </button>
            </div>
            <div className="qualification-list">
              {formData.qualifications.map((qual, index) => (
                <div key={index} className="qualification-item">
                  {qual}
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemoveQualification(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="button secondary" onClick={handleCloseModal}>
              Abbrechen
            </button>
            <button type="submit" className="button">
              {editingEmployee ? "Speichern" : "Hinzufügen"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EmployeeView; 