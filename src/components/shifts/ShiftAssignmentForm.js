// src/components/shifts/ShiftAssignmentForm.js
import React, { useState } from 'react';

function ShiftAssignmentForm({ date, time, employees, shiftTypes, existingShift, onSave, onCancel }) {
  const [entryType, setEntryType] = useState(existingShift?.isCustom ? 'custom' : 'shift');
  const [employeeId, setEmployeeId] = useState(existingShift?.employeeId || '');
  const [shiftTypeId, setShiftTypeId] = useState(existingShift?.shiftTypeId || '');
  const [notes, setNotes] = useState(existingShift?.notes || '');
  
  // Felder für freie Einträge
  const [customTitle, setCustomTitle] = useState(existingShift?.customTitle || '');
  const [customStartTime, setCustomStartTime] = useState(existingShift?.customStartTime || time || '07:00');
  const [customEndTime, setCustomEndTime] = useState(existingShift?.customEndTime || '');
  const [customColor, setCustomColor] = useState(existingShift?.customColor || 'blue');
  const [customEmployeeIds, setCustomEmployeeIds] = useState(existingShift?.customEmployeeIds || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (entryType === 'shift') {
      if (!employeeId || !shiftTypeId) {
        alert('Bitte wählen Sie einen Mitarbeiter und eine Schicht aus.');
        return;
      }
      
      onSave({
        date,
        time,
        employeeId,
        shiftTypeId,
        notes,
        isCustom: false
      });
    } else {
      if (!customTitle || !customStartTime || !customEndTime) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
      }
      
    onSave({
      date,
        time: customStartTime,
        isCustom: true,
        customTitle,
        customStartTime,
        customEndTime,
        customColor,
        customEmployeeIds,
        notes,
        // Füge den Namen des ersten Mitarbeiters als Hauptname hinzu
        name: customEmployeeIds.length > 0 
          ? employees.find(e => e.id === parseInt(customEmployeeIds[0]))?.name 
          : ''
      });
    }
  };

  const handleEmployeeToggle = (employeeId) => {
    setCustomEmployeeIds(prev => {
      const id = parseInt(employeeId);
      if (prev.includes(id)) {
        return prev.filter(eId => eId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="shift-assignment-form">
      <div className="form-group">
        <label className="form-label">Art des Eintrags</label>
        <div className="entry-type-toggle">
          <button
            type="button"
            className={`toggle-button ${entryType === 'shift' ? 'active' : ''}`}
            onClick={() => setEntryType('shift')}
          >
            Schicht zuweisen
          </button>
          <button
            type="button"
            className={`toggle-button ${entryType === 'custom' ? 'active' : ''}`}
            onClick={() => setEntryType('custom')}
          >
            Freier Eintrag
          </button>
        </div>
      </div>

      {entryType === 'shift' ? (
        <>
      <div className="form-group">
            <label className="form-label">Mitarbeiter</label>
        <select 
          className="form-select"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
        >
              <option value="">Bitte wählen...</option>
              {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
            <label className="form-label">Schicht</label>
        <select 
          className="form-select"
              value={shiftTypeId}
              onChange={(e) => setShiftTypeId(e.target.value)}
        >
              <option value="">Bitte wählen...</option>
              {shiftTypes.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
            </option>
          ))}
        </select>
      </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label">Titel*</label>
            <input
              type="text"
              className="form-input-full"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="z.B. Meeting, Pause, Termin..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Zeitraum*</label>
            <div className="time-range">
              <input
                type="time"
                className="form-input"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
              />
              <span className="time-separator">bis</span>
              <input
                type="time"
                className="form-input"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Beteiligte Mitarbeiter</label>
            <div className="employee-selection">
              {employees.map((employee) => (
                <label key={employee.id} className="employee-checkbox">
                  <input
                    type="checkbox"
                    checked={customEmployeeIds.includes(employee.id)}
                    onChange={() => handleEmployeeToggle(employee.id)}
                  />
                  <span className="employee-name">{employee.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Farbe</label>
            <select
              className="form-select"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
            >
              <option value="blue">Blau</option>
              <option value="green">Grün</option>
              <option value="yellow">Gelb</option>
              <option value="purple">Lila</option>
              <option value="red">Rot</option>
              <option value="gray">Grau</option>
            </select>
          </div>
        </>
      )}

      <div className="form-group">
        <label className="form-label">Notizen</label>
        <textarea 
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optionale Notizen..."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="button">
          {existingShift ? 'Aktualisieren' : 'Speichern'}
        </button>
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export default ShiftAssignmentForm;