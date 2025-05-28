import React from 'react';

const ShiftCard = ({ 
  shift, 
  shiftType, 
  isSelected, 
  onShiftClick, 
  isEditable 
}) => {
  const shiftStyle = {
    position: 'absolute',
    top: `${shift.top}px`,
    height: `${shift.height}px`,
    width: shift.width || '100%',
    left: shift.left || '0'
  };

  if (shift.isCustom) {
    const isAbsence = shift.type === 'vacation' || shift.type === 'sick';
    const cardClassName = `shift-card custom-entry shift-${shift.type} ${isAbsence ? 'absence-entry' : ''} ${isSelected ? 'selected' : ''}`;

    return (
      <div
        key={shift.id}
        className={cardClassName}
        style={shiftStyle}
        onClick={onShiftClick}
      >
        <div className="shift-header">
          <div className="shift-type">
            {isAbsence ? (
              shift.type === 'vacation' ? 'Urlaub' : 'Krank'
            ) : shift.customTitle}
          </div>
          <div className="shift-employee">
            {shift.customEmployeeIds ? 
              shift.customEmployeeIds.map(empId => shift.employees?.find(e => e.id === parseInt(empId))?.name).join(', ') : 
              shift.name
            }
          </div>
          {shift.notes && (
            <div className="shift-notes">{shift.notes}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      key={shift.id}
      className={`shift-card shift-${shiftType?.color || 'gray'} ${isSelected ? 'selected' : ''}`}
      style={shiftStyle}
      onClick={onShiftClick}
    >
      <div className="shift-header">
        <div className="shift-type">{shiftType?.name}</div>
        <div className="shift-employee">{shift.name}</div>
        {shift.notes && (
          <div className="shift-notes">{shift.notes}</div>
        )}
      </div>
    </div>
  );
};

export default ShiftCard; 