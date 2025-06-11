import React, { memo } from 'react';
import ShiftCard from '../shifts/ShiftCard';

const ScheduleCell = memo(({ 
  day, 
  time, 
  isFirstRow, 
  shifts, 
  shiftTypes, 
  employees, 
  selectedShiftId,
  isEditable,
  onShiftClick,
  onAddClick,
  isFullWidth,
  currentUser
}) => {
  return (
    <td className={`schedule-cell ${isFullWidth ? 'full-width' : ''}`}>
      {isFirstRow && shifts && (
        <div className="day-container">
          {shifts.map(shift => {
            const shiftType = !shift.isCustom ? shiftTypes.find(t => t.id === shift.shiftTypeId) : null;
            return (
              <ShiftCard
                key={shift.id}
                shift={shift}
                shiftType={shiftType}
                employees={employees}
                isSelected={selectedShiftId === shift.id}
                isEditable={isEditable}
                onShiftClick={() => onShiftClick(shift, day, time)}
                style={{
                  position: 'absolute',
                  top: `${shift.top}px`,
                  height: `${shift.height}px`,
                  width: shift.width,
                  left: shift.left
                }}
                currentUser={currentUser}
              />
            );
          })}
        </div>
      )}
      {isEditable && (
        <button 
          className="add-shift-button" 
          onClick={() => onAddClick(day, time)}
        >+</button>
      )}
    </td>
  );
});

export default ScheduleCell; 