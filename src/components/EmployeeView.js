import React from 'react';
import { useEmployeeManagement } from '../hooks/useEmployeeManagement';
import { useAppContext } from '../contexts/AppContext';
import Modal from './common/Modal';
import EmployeeForm from './employees/EmployeeForm';

function EmployeeView() {
  const { state, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
  const {
    filteredEmployees,
    searchTerm,
    setSearchTerm,
    modalOpen,
    setModalOpen,
    currentEmployee,
    handleAddEmployee,
    handleEditEmployee,
    handleSaveEmployee,
    handleDeleteEmployee
  } = useEmployeeManagement(state.employees);

  // Wrapper für handleSaveEmployee, der den Context aktualisiert
  const handleSave = (employeeData) => {
    if (currentEmployee) {
      updateEmployee(employeeData);
    } else {
      addEmployee(employeeData);
    }
    setModalOpen(false);
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
        {filteredEmployees.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Keine Mitarbeiter gefunden
          </div>
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={currentEmployee ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
      >
        <EmployeeForm
          employee={currentEmployee}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default EmployeeView;