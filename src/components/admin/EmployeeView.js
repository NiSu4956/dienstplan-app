import React, { useState } from 'react';
import Modal from '../common/Modal';
import WorkingHoursOverview from '../employees/WorkingHoursOverview';
import '../../styles/WorkingHoursOverview.css';

function EmployeeView({ employees, setEmployees, scheduleData, shiftTypes }) {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showHoursOverview, setShowHoursOverview] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: 'Vollzeit',
    qualifications: [],
    workingHours: 40
  });
  const [newQualification, setNewQualification] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingEmployee) {
      // Mitarbeiter bearbeiten
      const updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id ? { ...formData, id: emp.id } : emp
      );
      setEmployees(updatedEmployees);
    } else {
      // Neuen Mitarbeiter hinzufügen
      const newEmployee = {
        ...formData,
        id: Math.max(0, ...employees.map(e => e.id)) + 1
      };
      setEmployees([...employees, newEmployee]);
    }
    
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({ name: '', role: 'Vollzeit', qualifications: [], workingHours: 40 });
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      qualifications: [...employee.qualifications],
      workingHours: employee.workingHours || (employee.role === 'Vollzeit' ? 40 : 0)
    });
    setShowModal(true);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: newRole,
      workingHours: newRole === 'Vollzeit' ? 40 : prev.workingHours
    }));
  };

  const handleDelete = (id) => {
    if (window.confirm('Möchten Sie diesen Mitarbeiter wirklich löschen?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleQualificationAdd = () => {
    if (newQualification.trim() && !formData.qualifications.includes(newQualification.trim())) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, newQualification.trim()]
      });
      setNewQualification('');
    }
  };

  const handleQualificationRemove = (qual) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter(q => q !== qual)
    });
  };

  const handleHoursOverview = (employee) => {
    setSelectedEmployee(employee);
    setShowHoursOverview(true);
  };

  const filteredEmployees = employees
    .filter(emp => emp.role !== 'admin')
    .filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.qualifications.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Mitarbeiterverwaltung</h2>
            <div className="card-actions">
              <div className="search-container">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Mitarbeiter suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="button primary" 
                onClick={() => {
                  setEditingEmployee(null);
                  setFormData({ name: '', role: 'Vollzeit', qualifications: [], workingHours: 40 });
                  setShowModal(true);
                }}
              >
                Mitarbeiter hinzufügen
              </button>
            </div>
          </div>

          <div className="children-list">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-header">
                    <h3 className="list-item-title">{employee.name}</h3>
                    <span className="list-item-group">{employee.role}</span>
                  </div>
                  <div className="list-item-details">
                    {employee.qualifications.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Qualifikationen:</span>
                        <div className="detail-value">
                          {employee.qualifications.join(', ')}
                        </div>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Wochenarbeitsstunden:</span>
                      <div className="detail-value">
                        {employee.workingHours || (employee.role === 'Vollzeit' ? 40 : 0)} Stunden
                      </div>
                    </div>
                  </div>
                </div>
                <div className="list-item-actions">
                  <button
                    className="button primary"
                    onClick={() => handleHoursOverview(employee)}
                  >
                    Stundenübersicht
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => handleEdit(employee)}
                  >
                    Bearbeiten
                  </button>
                  <button
                    className="button delete"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
            {filteredEmployees.length === 0 && (
              <div className="empty-state">
                Keine Mitarbeiter gefunden.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEmployee(null);
          setFormData({ name: '', role: 'Vollzeit', qualifications: [], workingHours: 40 });
        }}
        title={editingEmployee ? "Mitarbeiter bearbeiten" : "Mitarbeiter hinzufügen"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rolle</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={handleRoleChange}
            >
              <option value="Vollzeit">Vollzeit</option>
              <option value="Teilzeit">Teilzeit</option>
              <option value="Aushilfe">Aushilfe</option>
            </select>
          </div>

          {formData.role !== 'Vollzeit' && (
            <div className="form-group">
              <label className="form-label">Wochenarbeitsstunden</label>
              <input
                type="number"
                className="form-input-full"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: parseFloat(e.target.value) || 0 })}
                min="0"
                max="40"
                step="0.5"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Qualifikationen</label>
            <div className="qualification-add">
              <input
                type="text"
                className="form-select-sm"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
              />
              <button
                type="button"
                className="button-sm"
                onClick={handleQualificationAdd}
                disabled={!newQualification.trim()}
              >
                +
              </button>
            </div>
            <div className="mt-2">
              {formData.qualifications.map((qual, index) => (
                <span key={index} className="tag-with-remove">
                  {qual}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleQualificationRemove(qual)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="button primary">
              {editingEmployee ? "Speichern" : "Hinzufügen"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showHoursOverview}
        onClose={() => {
          setShowHoursOverview(false);
          setSelectedEmployee(null);
        }}
        title="Stundenübersicht"
      >
        {selectedEmployee && (
          <WorkingHoursOverview
            employee={selectedEmployee}
            scheduleData={scheduleData}
            shiftTypes={shiftTypes}
            onClose={() => {
              setShowHoursOverview(false);
              setSelectedEmployee(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

export default EmployeeView; 