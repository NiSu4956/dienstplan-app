import { checkEmployeeAvailability, checkDuplicateShifts, getTimeInMinutes } from './shiftUtils';

export const handleShiftSave = ({
  shiftData,
  currentShift,
  scheduleData,
  selectedWeek,
  modalData,
  shiftTypes,
  employees
}) => {
  const { 
    date, 
    time, 
    employeeId, 
    shiftTypeId, 
    notes, 
    isCustom, 
    customTitle, 
    customStartTime, 
    customEndTime, 
    customColor,
    customEmployeeIds 
  } = shiftData;
  
  // Prüfe auf doppelte Schichten
  if (!isCustom && checkDuplicateShifts(date, parseInt(shiftTypeId), currentShift?.id, scheduleData, selectedWeek)) {
    const shiftType = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
    throw new Error(`Diese Schicht (${shiftType?.name}) wurde bereits für diesen Tag vergeben!`);
  }

  // Erstelle temporäre Schicht für Verfügbarkeitsprüfung
  const tempShift = {
    isCustom,
    customStartTime,
    customEndTime,
    shiftTypeId: parseInt(shiftTypeId),
    employeeId: parseInt(employeeId)
  };

  // Prüfe Verfügbarkeit für alle betroffenen Mitarbeiter
  const employeesToCheck = isCustom ? customEmployeeIds : [employeeId];
  
  for (const empId of employeesToCheck) {
    const availability = checkEmployeeAvailability(
      parseInt(empId),
      tempShift,
      currentShift?.id,
      scheduleData,
      selectedWeek,
      modalData.day,
      shiftTypes
    );

    if (!availability.available) {
      const conflictingShiftType = availability.conflictingShift.isCustom 
        ? null 
        : shiftTypes.find(t => t.id === availability.conflictingShift.shiftTypeId);

      throw new Error(
        `${availability.employee.name} ist bereits in einer anderen Schicht eingeteilt:\n` +
        `${availability.conflictingShift.isCustom 
          ? availability.conflictingShift.customTitle 
          : conflictingShiftType?.name
        } (${availability.conflictingShift.isCustom 
          ? `${availability.conflictingShift.customStartTime} - ${availability.conflictingShift.customEndTime}`
          : `${conflictingShiftType?.startTime} - ${conflictingShiftType?.endTime}`
        })`
      );
    }
  }
  
  // Hole die existierenden Dokumentationen aus der aktuellen Schicht
  const existingDocumentations = currentShift?.documentations || [];
  
  if (isCustom) {
    // Stelle sicher, dass die IDs als Zahlen gespeichert werden
    const employeeIdsAsNumbers = (customEmployeeIds || []).map(id => parseInt(id));
    const mainEmployee = employees.find(e => e.id === employeeIdsAsNumbers[0]);
    
    return {
      id: currentShift ? currentShift.id : Date.now(),
      isCustom: true,
      customTitle,
      customStartTime,
      customEndTime,
      customColor,
      customEmployeeIds: employeeIdsAsNumbers,
      notes,
      type: customColor,
      name: mainEmployee ? mainEmployee.name : customTitle,
      documentations: existingDocumentations
    };
  } else {
    const employee = employees.find(e => e.id === parseInt(employeeId));
    const shiftType = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
    
    if (!employee || !shiftType) {
      throw new Error('Ungültige Mitarbeiter- oder Schichttyp-ID');
    }
    
    return {
      id: currentShift ? currentShift.id : Date.now(),
      employeeId: parseInt(employeeId),
      name: employee.name,
      shiftTypeId: parseInt(shiftTypeId),
      task: shiftType.name,
      tasks: shiftType.tasks || [],
      type: shiftType.color,
      notes,
      isCustom: false,
      documentations: existingDocumentations
    };
  }
};

export const updateScheduleWithNewShift = (scheduleData, selectedWeek, date, time, newShift, currentShift = null) => {
  const newData = { ...scheduleData };
  
  // Wenn es sich um eine Bearbeitung handelt, entferne den alten Eintrag
  if (currentShift) {
    if (newData[selectedWeek]?.[date]) {
      Object.keys(newData[selectedWeek][date]).forEach(timeSlot => {
        newData[selectedWeek][date][timeSlot] = newData[selectedWeek][date][timeSlot]
          .filter(shift => shift.id !== currentShift.id);
        
        if (newData[selectedWeek][date][timeSlot].length === 0) {
          delete newData[selectedWeek][date][timeSlot];
        }
      });
      
      if (Object.keys(newData[selectedWeek][date]).length === 0) {
        delete newData[selectedWeek][date];
      }
    }
  }
  
  // Füge den neuen/bearbeiteten Eintrag hinzu
  if (!newData[selectedWeek]) newData[selectedWeek] = {};
  if (!newData[selectedWeek][date]) newData[selectedWeek][date] = {};
  if (!newData[selectedWeek][date][time]) newData[selectedWeek][date][time] = [];
  
  newData[selectedWeek][date][time].push(newShift);
  
  return newData;
};

export const deleteShiftFromSchedule = (scheduleData, selectedWeek, day, shiftId) => {
  const newData = { ...scheduleData };
  
  if (newData[selectedWeek]?.[day]) {
    // Durchsuche alle Zeitslots des Tages
    Object.keys(newData[selectedWeek][day]).forEach(timeSlot => {
      if (newData[selectedWeek][day][timeSlot]) {
        const filteredShifts = newData[selectedWeek][day][timeSlot].filter(s => s.id !== shiftId);
        if (filteredShifts.length === 0) {
          delete newData[selectedWeek][day][timeSlot];
        } else {
          newData[selectedWeek][day][timeSlot] = filteredShifts;
        }
      }
    });

    // Bereinige leere Strukturen
    if (Object.keys(newData[selectedWeek][day]).length === 0) {
      delete newData[selectedWeek][day];
    }
    if (Object.keys(newData[selectedWeek]).length === 0) {
      delete newData[selectedWeek];
    }
  }
  
  return newData;
};

// Prüft ob ein Mitarbeiter an einem bestimmten Tag verfügbar ist
const isEmployeeAvailable = (employee, date) => {
  if (!employee || !employee.availability) return false;
  
  const day = date.getDay();
  return employee.availability[day];
};

// Prüft auf Überschneidungen mit existierenden Schichten
const checkShiftOverlap = (shift1, shift2) => {
  const start1 = getTimeInMinutes(shift1.startTime);
  const end1 = getTimeInMinutes(shift1.endTime);
  const start2 = getTimeInMinutes(shift2.startTime);
  const end2 = getTimeInMinutes(shift2.endTime);

  return (start1 < end2 && end1 > start2);
};

// Validiert eine Schichtzuweisung
export const validateShiftAssignment = (shift, employee, scheduleData) => {
  const date = new Date(shift.date);
  
  // Prüfe Verfügbarkeit
  if (!isEmployeeAvailable(employee, date)) {
    return {
      isValid: false,
      message: 'Der Mitarbeiter ist an diesem Tag nicht verfügbar.'
    };
  }

  // Prüfe auf Überschneidungen
  const existingShifts = scheduleData[shift.week]?.[shift.day] || {};
  for (const timeSlot in existingShifts) {
    const shifts = existingShifts[timeSlot];
    for (const existingShift of shifts) {
      if (existingShift.employeeId === employee.id) {
        if (checkShiftOverlap(shift, existingShift)) {
          return {
            isValid: false,
            message: 'Der Mitarbeiter hat bereits eine überlappende Schicht an diesem Tag.'
          };
        }
      }
    }
  }

  return { isValid: true };
};

// Organisiert überlappende Schichten
export const organizeOverlappingShifts = (shifts) => {
  if (!shifts || shifts.length === 0) return [];
  
  // Sortiere Schichten nach Startzeit
  const sortedShifts = [...shifts].sort((a, b) => {
    const startA = getTimeInMinutes(a.startTime);
    const startB = getTimeInMinutes(b.startTime);
    return startA - startB;
  });

  // Gruppiere überlappende Schichten
  const groups = [];
  let currentGroup = [sortedShifts[0]];

  for (let i = 1; i < sortedShifts.length; i++) {
    const currentShift = sortedShifts[i];
    const lastShiftInGroup = currentGroup[currentGroup.length - 1];

    if (checkShiftOverlap(lastShiftInGroup, currentShift)) {
      currentGroup.push(currentShift);
    } else {
      groups.push([...currentGroup]);
      currentGroup = [currentShift];
    }
  }
  groups.push(currentGroup);

  return groups;
}; 