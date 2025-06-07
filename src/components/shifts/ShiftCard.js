import React, { memo } from 'react';
import { isUserShift, getEmployeeNames } from '../../utils/commonUtils';

const ShiftCard = memo(({ 
  shift, 
  shiftType,
  employees, 
  isSelected, 
  isEditable, 
  onShiftClick, 
  style,
  currentUser 
}) => {
  const isCustom = shift.isCustom;
  const isAbsence = isCustom && (shift.type === 'vacation' || shift.type === 'sick');
  const isCurrentUserShift = isUserShift(shift, currentUser);
  
  const cardClassName = `shift-card ${
    isCustom ? `custom-entry shift-${shift.type}` : `shift-${shiftType?.color || 'gray'}`
  } ${isAbsence ? 'absence-entry' : ''} ${
    isSelected ? 'selected' : ''
  } ${isCurrentUserShift ? 'user-shift' : ''}`;

  return (
    <div
      className={cardClassName}
      style={style}
      onClick={(isEditable || isCurrentUserShift) ? onShiftClick : undefined}
      title={isCurrentUserShift && !isEditable ? "Klicken Sie hier, um Details zu Ihrer Schicht zu sehen" : undefined}
    >
      <div className="shift-header">
        {isAbsence ? (
          <div className="absence-header">
            <span className="absence-type">
              {shift.type === 'vacation' ? (
                <>
                  <span className="absence-icon">🏖️</span>
                  <span className="absence-employee-name">{getEmployeeNames(shift, employees)} - Urlaub</span>
                </>
              ) : (
                <>
                  <span className="absence-icon">🤒</span>
                  <span className="absence-employee-name">{getEmployeeNames(shift, employees)} - Krank</span>
                </>
              )}
            </span>
          </div>
        ) : (
          <>
            <div className="shift-type">
              {isCustom ? shift.customTitle : shiftType?.name}
            </div>
            <div className="shift-employee">
              {getEmployeeNames(shift, employees)}
            </div>
            {shift.tasks?.length > 0 && (
              <div className="shift-tasks">
                {shift.tasks.join(', ')}
              </div>
            )}
            {shift.notes && (
              <div className="shift-notes">
                {shift.notes}
              </div>
            )}
          </>
        )}
      </div>
      {isSelected && isEditable && (
        <div className="shift-selected-indicator" />
      )}
    </div>
  );
});

export default ShiftCard; 