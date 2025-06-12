import { useState, useCallback, useMemo } from 'react';

/**
 * Custom Hook für die Mitarbeiterverwaltung
 * @param {Array} initialEmployees - Initiale Liste der Mitarbeiter
 * @returns {Object} Mitarbeiterverwaltungs-Funktionen und -Zustand
 */
export const useEmployeeManagement = (initialEmployees = []) => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Gefilterte Mitarbeiter basierend auf dem Suchbegriff
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.qualifications.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, searchTerm]);

  // Mitarbeiter hinzufügen
  const handleAddEmployee = useCallback(() => {
    setCurrentEmployee(null);
    setModalOpen(true);
  }, []);

  // Mitarbeiter bearbeiten
  const handleEditEmployee = useCallback((employee) => {
    setCurrentEmployee(employee);
    setModalOpen(true);
  }, []);

  // Mitarbeiter speichern
  const handleSaveEmployee = useCallback((employeeData) => {
    setEmployees(prev => {
      if (currentEmployee) {
        // Bearbeiten eines bestehenden Mitarbeiters
        return prev.map(emp => 
          emp.id === employeeData.id ? employeeData : emp
        );
      } else {
        // Hinzufügen eines neuen Mitarbeiters
        return [...prev, { ...employeeData, id: Date.now() }];
      }
    });
    setModalOpen(false);
  }, [currentEmployee]);

  // Mitarbeiter löschen
  const handleDeleteEmployee = useCallback((id) => {
    if (window.confirm('Möchten Sie diesen Mitarbeiter wirklich löschen?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  }, []);

  return {
    employees,
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
  };
}; 