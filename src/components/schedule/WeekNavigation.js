import React from 'react';
import { getWeekString, getFirstDayOfWeek } from '../../utils/dateUtils';

const WeekNavigation = ({ 
  currentWeek, 
  currentYear, 
  onWeekChange, 
  onExport, 
  onPdfExport 
}) => {
  const weekString = getWeekString(currentWeek, currentYear);
  const firstDayOfWeek = getFirstDayOfWeek(currentWeek, currentYear);

  return (
    <div className="week-navigation">
      <div className="week-controls">
        <button onClick={() => onWeekChange('prev')}>←</button>
        <span className="week-display">{weekString}</span>
        <button onClick={() => onWeekChange('next')}>→</button>
      </div>
      <div className="export-controls">
        <button onClick={onExport}>Export</button>
        <button onClick={onPdfExport}>PDF</button>
      </div>
    </div>
  );
};

export default WeekNavigation; 