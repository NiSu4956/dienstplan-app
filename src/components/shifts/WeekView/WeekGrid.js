import React, { useMemo, useCallback, memo } from 'react';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../../constants/dateFormats';
import { organizeOverlappingShifts } from '../../../utils/shiftUtils';
import ScheduleCell from './ScheduleCell';

const WeekGrid = memo(({
  selectedWeek,
  scheduleData,
  shiftTypes,
  employees,
  selectedShiftId,
  isEditable,
  onShiftClick,
  onAddClick,
  currentUser,
  selectedEmployee
}) => {
  const days = useMemo(() => DAYS_OF_WEEK, []);
  const timeSlots = useMemo(() => TIME_SLOTS, []);

  // Memoize the shift organization for each cell
  const getOrganizedShifts = useCallback((day, time) => {
    const shifts = scheduleData[selectedWeek]?.[day]?.[time] || [];
    return organizeOverlappingShifts(shifts, shiftTypes, timeSlots);
  }, [scheduleData, selectedWeek, shiftTypes, timeSlots]);

  return (
    <table className="week-grid">
      <tbody>
        {timeSlots.map((time, timeIndex) => (
          <tr key={time}>
            <td className="time-slot">{time}</td>
            {days.map(day => {
              const organizedShifts = getOrganizedShifts(day, time);
              const shifts = scheduleData[selectedWeek]?.[day]?.[time] || [];
              
              return (
                <ScheduleCell
                  key={`${day}-${time}`}
                  day={day}
                  time={time}
                  isFirstRow={timeIndex === 0}
                  shifts={organizedShifts}
                  shiftTypes={shiftTypes}
                  employees={employees}
                  selectedShiftId={selectedShiftId}
                  isEditable={isEditable}
                  onShiftClick={onShiftClick}
                  onAddClick={onAddClick}
                  isFullWidth={shifts.length > 0}
                  currentUser={currentUser}
                  selectedEmployee={selectedEmployee}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
});

WeekGrid.displayName = 'WeekGrid';

export default WeekGrid; 