import React from 'react';
import { getNextWeek, getPreviousWeek } from '../../utils/weekList';

const WeekNavigation = ({ 
  selectedWeek, 
  weekList, 
  onWeekChange 
}) => {
  return (
    <div className="week-navigation">
      <button
        className="week-nav-button"
        onClick={() => onWeekChange(getPreviousWeek(selectedWeek, weekList))}
        disabled={weekList.indexOf(selectedWeek) === 0}
      >
        ◀
      </button>
      <select
        className="select"
        value={selectedWeek}
        onChange={(e) => onWeekChange(e.target.value)}
      >
        {weekList.map((week) => (
          <option key={week} value={week}>{week}</option>
        ))}
      </select>
      <button
        className="week-nav-button"
        onClick={() => onWeekChange(getNextWeek(selectedWeek, weekList))}
        disabled={weekList.indexOf(selectedWeek) === weekList.length - 1}
      >
        ▶
      </button>
    </div>
  );
};

export default WeekNavigation; 