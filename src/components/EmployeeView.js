import React, { useState } from 'react';
import Modal from './common/Modal';
import EmployeeForm from './employees/EmployeeForm';

function EmployeeView({ employees, setEmployees }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Filtern der Mitarbeiter basierend auf dem Suchbegriff
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.qualifications.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Öffnet das Modal zum Hinzufügen eines Mitarbeiters
  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setModalOpen(true);
  };

  // Öffnet das Modal zum Bearbeiten eines Mitarbeiters
  const handleEditEmployee = (employee) => {
    setCurrentEmployee(employee);
    setModalOpen(true);
  };

  // Speichert einen neuen oder bearbeiteten Mitarbeiter
  const handleSaveEmployee = (employeeData) => {
    if (currentEmployee) {
      // Bearbeiten eines bestehenden Mitarbeiters
      setEmployees(prev =>
        prev.map(emp => emp.id === employeeData.id ? employeeData : emp)
      );
    } else {
      // Hinzufügen eines neuen Mitarbeiters
      setEmployees(prev => [...prev, employeeData]);
    }
    setModalOpen(false);
  };

  // Löscht einen Mitarbeiter
  const handleDeleteEmployee = (id) => {
    if (!window.confirm('Möchtest du diesen Mitarbeiter wirklich löschen?')) return;
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  return (
    <div className="employee-view">
      <div className="flex justify-between items-center mb-4">
        <div className="search-bar">
            <input
              type="text"
              className="search-input"
            placeholder="Mitarbeiter suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="button" onClick={handleAddEmployee}>
            Mitarbeiter hinzufügen
          </button>
        </div>

      <div className="employee-list">
        {filteredEmployees.map(employee => (
          <div key={employee.id} className="employee-card">
            <div className="employee-info">
              <div className="employee-name">{employee.name}</div>
              <div className="employee-role">{employee.role}</div>
              {employee.qualifications.length > 0 && (
                <div className="employee-qualifications">
                  {employee.qualifications.map((qual, index) => (
                    <span key={index} className="qualification-tag">
                      {qual}
                    </span>
                      ))}
                    </div>
              )}
            </div>
            <div className="employee-actions">
                      <button
                className="button"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        Bearbeiten
                      </button>
                      <button
                className="button secondary"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        Löschen
                      </button>
                    </div>
          </div>
        ))}
      </div>
      
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={currentEmployee ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
      >
        <EmployeeForm 
          employee={currentEmployee}
          onSave={handleSaveEmployee}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default EmployeeView;