import React from 'react';
import { getWeekString, getFirstDayOfWeek } from '../../../utils/dateUtils';

function WeekHeader({ 
  selectedWeek, 
  weeks, 
  onWeekChange, 
  onExport, 
  onPdfExport,
  selectedEmployee,
  onEmployeeChange,
  employees
}) {
  const currentWeekIndex = weeks.indexOf(selectedWeek);
  const canGoBack = currentWeekIndex > 0;
  const canGoForward = currentWeekIndex < weeks.length - 1;

  return (
    <div className="week-header">
      <div className="week-navigation">
        <button 
          className="week-nav-button"
          onClick={() => onWeekChange('prev')}
          disabled={weeks.indexOf(selectedWeek) === 0}
        >
          ←
        </button>
        <select 
          className="week-select"
          value={selectedWeek}
          onChange={(e) => onWeekChange('select', e.target.value)}
        >
          {weeks.map(week => (
            <option key={week} value={week}>{week}</option>
          ))}
        </select>
        <button 
          className="week-nav-button"
          onClick={() => onWeekChange('next')}
          disabled={weeks.indexOf(selectedWeek) === weeks.length - 1}
        >
          →
        </button>
      </div>

      <div className="filter-container">
        <select
          className="employee-filter"
          value={selectedEmployee || ''}
          onChange={(e) => onEmployeeChange(e.target.value || null)}
        >
          <option value="">Alle Mitarbeiter</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      <div className="export-buttons">
        <button className="button" onClick={onExport}>
          CSV Export
        </button>
        <button className="button" onClick={onPdfExport}>
          PDF Export
        </button>
      </div>
    </div>
  );
}

export default WeekHeader; 