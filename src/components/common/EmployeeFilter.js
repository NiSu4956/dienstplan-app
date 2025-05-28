import React from 'react';

const EmployeeFilter = ({ 
  selectedEmployee, 
  employees, 
  onEmployeeChange 
}) => {
  return (
    <div className="employee-filter">
      <select
        className="filter-select"
        value={selectedEmployee}
        onChange={(e) => onEmployeeChange(e.target.value)}
      >
        <option value="">Alle Mitarbeiter</option>
        {employees.map(employee => (
          <option key={employee.id} value={employee.id}>
            {employee.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EmployeeFilter; 