import React, { useMemo } from 'react';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../../constants/dateFormats';
import { organizeOverlappingShifts } from '../../../utils/shiftUtils';
import ScheduleCell from './ScheduleCell';

function WeekGrid({
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
}) {
  const days = useMemo(() => DAYS_OF_WEEK, []);
  const timeSlots = useMemo(() => TIME_SLOTS, []);

  return (
    <>
      {timeSlots.map((time, timeIndex) => (
        <tr key={time}>
          <td className="time-slot">{time}</td>
          {days.map(day => {
            const shifts = scheduleData[selectedWeek]?.[day]?.[time] || [];
            const organizedShifts = organizeOverlappingShifts(shifts, shiftTypes, timeSlots);
            
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
    </>
  );
}

export default WeekGrid; 