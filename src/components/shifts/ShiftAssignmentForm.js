// src/components/shifts/ShiftAssignmentForm.js
import React, { useState } from 'react';
import { checkEmployeeAvailability } from '../../utils/shiftUtils';

function ShiftAssignmentForm({ 
  date, 
  time, 
  employees, 
  shiftTypes, 
  existingShift, 
  onSave, 
  onCancel,
  scheduleData,  // Neue Prop
  selectedWeek   // Neue Prop
}) {
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

      // Prüfe, ob es sich um eine Wochenendschicht handelt
      const selectedShiftType = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
      if (selectedShiftType?.name === 'Wochenende' && !['Samstag', 'Sonntag'].includes(date)) {
        alert('Die Wochenendschicht kann nur für Samstag oder Sonntag eingeplant werden.');
        return;
      }

      // Prüfe, ob der Mitarbeiter die erforderlichen Qualifikationen hat
      const employee = employees.find(e => e.id === parseInt(employeeId));
      if (!employee) return;

      const requiredQualifications = selectedShiftType?.requiredQualifications || [];
      const missingQualifications = requiredQualifications.filter(
        qual => !employee.qualifications?.includes(qual)
      );

      if (missingQualifications.length > 0) {
        alert(`${employee.name} fehlen folgende erforderliche Qualifikationen für diese Schicht:\n${missingQualifications.join(', ')}`);
        return;
      }

      // Prüfe die Verfügbarkeit des Mitarbeiters
      const tempShift = {
        isCustom: false,
        shiftTypeId: parseInt(shiftTypeId)
      };

      const availability = checkEmployeeAvailability(
        parseInt(employeeId),
        tempShift,
        existingShift?.id,
        scheduleData,
        selectedWeek,
        date,
        shiftTypes
      );

      if (!availability.available) {
        if (availability.reason) {
          alert(`${employee.name} hat zu dieser Zeit ${availability.reason}.`);
        } else {
          const conflictingShiftType = availability.conflictingShift.isCustom 
            ? null 
            : shiftTypes.find(t => t.id === availability.conflictingShift.shiftTypeId);

          alert(`${employee.name} ist bereits in einer anderen Schicht eingeteilt:\n` +
            `${availability.conflictingShift.isCustom 
              ? availability.conflictingShift.customTitle 
              : conflictingShiftType?.name
            } (${availability.conflictingShift.isCustom 
              ? `${availability.conflictingShift.customStartTime} - ${availability.conflictingShift.customEndTime}`
              : `${conflictingShiftType?.startTime} - ${conflictingShiftType?.endTime}`
            })`);
        }
        return;
      }
      
      onSave({
        date,
        time,
        employeeId,
        shiftTypeId,
        notes,
        isCustom: false,
        tasks: selectedShiftType?.tasks || []
      });
    } else {
      if (!customTitle || !customStartTime || !customEndTime) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
      }

      // Prüfe für jeden ausgewählten Mitarbeiter, ob er verfügbar ist
      for (const empId of customEmployeeIds) {
        const tempShift = {
          isCustom: true,
          customStartTime,
          customEndTime,
          type: customColor === 'vacation' ? 'vacation' : (customColor === 'sick' ? 'sick' : undefined)
        };
        
        const availability = checkEmployeeAvailability(
          parseInt(empId),
          tempShift,
          existingShift?.id,
          scheduleData,
          selectedWeek,
          date,
          shiftTypes
        );

        if (!availability.available) {
          const employee = employees.find(e => e.id === parseInt(empId));
          if (availability.reason) {
            alert(`${employee?.name} hat zu dieser Zeit bereits ${availability.reason}.`);
          } else {
            const conflictingShiftType = availability.conflictingShift.isCustom 
              ? null 
              : shiftTypes.find(t => t.id === availability.conflictingShift.shiftTypeId);

            // Angepasste Fehlermeldung für Urlaubs- oder Krankheitseinträge
            if (customColor === 'vacation' || customColor === 'sick') {
              alert(`${employee?.name} ist zu dieser Zeit bereits in einer Schicht eingeteilt:\n` +
                `${availability.conflictingShift.isCustom 
                  ? availability.conflictingShift.customTitle 
                  : conflictingShiftType?.name
                } (${availability.conflictingShift.isCustom 
                  ? `${availability.conflictingShift.customStartTime} - ${availability.conflictingShift.customEndTime}`
                  : `${conflictingShiftType?.startTime} - ${conflictingShiftType?.endTime}`
                })\n\nBitte entfernen Sie zuerst die Schichtzuweisung, bevor Sie ${customColor === 'vacation' ? 'Urlaub' : 'eine Krankmeldung'} eintragen.`);
            } else {
              alert(`${employee?.name} ist bereits in einer anderen Schicht eingeteilt:\n` +
                `${availability.conflictingShift.isCustom 
                  ? availability.conflictingShift.customTitle 
                  : conflictingShiftType?.name
                } (${availability.conflictingShift.isCustom 
                  ? `${availability.conflictingShift.customStartTime} - ${availability.conflictingShift.customEndTime}`
                  : `${conflictingShiftType?.startTime} - ${conflictingShiftType?.endTime}`
                })`);
            }
          }
          return;
        }
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
        type: customColor === 'vacation' ? 'vacation' : (customColor === 'sick' ? 'sick' : customColor),
        name: customEmployeeIds.length > 0 
          ? employees.find(e => e.id === parseInt(customEmployeeIds[0]))?.name 
          : ''
      });
    }
  };

  // Markiere die ungenutzte Funktion als ignoriert
  // eslint-disable-next-line no-unused-vars
  const handleEmployeeToggle = (employeeId) => {
    // Funktion wird später implementiert
  };

  // Filtere die Mitarbeiter basierend auf den erforderlichen Qualifikationen
  const getFilteredEmployees = () => {
    if (!shiftTypeId) return employees;
    
    const selectedShiftType = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
    if (!selectedShiftType?.requiredQualifications?.length) return employees;

    return employees.filter(employee => 
      selectedShiftType.requiredQualifications.every(
        qual => employee.qualifications?.includes(qual)
      )
    );
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
            <label className="form-label">Schicht</label>
            <select 
              className="form-select"
              value={shiftTypeId}
              onChange={(e) => {
                setShiftTypeId(e.target.value);
                // Setze den Mitarbeiter zurück, wenn die neue Schicht andere Qualifikationen erfordert
                setEmployeeId('');
              }}
            >
              <option value="">Bitte wählen...</option>
              {shiftTypes.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
                  {shift.requiredQualifications?.length > 0 && ` - Qualifikationen: ${shift.requiredQualifications.join(', ')}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mitarbeiter</label>
            <select 
              className="form-select"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Bitte wählen...</option>
              {getFilteredEmployees().map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
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
            <select
              className="form-select"
              value={customEmployeeIds[0] || ''}
              onChange={(e) => setCustomEmployeeIds([parseInt(e.target.value)])}
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