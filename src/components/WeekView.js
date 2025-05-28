import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import ShiftAssignmentForm from './shifts/ShiftAssignmentForm';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Hilfsfunktion zur Umrechnung der Zeit in Minuten
const getTimeInMinutes = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Hilfsfunktion zur Berechnung der Position einer Schicht
const calculateShiftPosition = (shift, shiftTypes) => {
  const timelineStart = getTimeInMinutes('7:00'); // Startzeit der Timeline
  let startMinutes, endMinutes;

  if (shift.isCustom) {
    startMinutes = getTimeInMinutes(shift.customStartTime);
    endMinutes = getTimeInMinutes(shift.customEndTime);
  } else {
    const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
    if (!shiftType) return null;
    startMinutes = getTimeInMinutes(shiftType.startTime);
    endMinutes = getTimeInMinutes(shiftType.endTime);
  }

  // Behandle Schichten über Mitternacht
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const top = ((startMinutes - timelineStart) / 60) * 60; // 60px pro Stunde
  const height = ((endMinutes - startMinutes) / 60) * 60;

  return { top, height };
};

// Hilfsfunktion für die Berechnung von Schichtüberlappungen
const organizeOverlappingShifts = (shifts, shiftTypes) => {
  if (!shifts || shifts.length === 0) return [];

  // Berechne Start- und Endzeiten für alle Schichten
  const shiftsWithTimes = shifts.map(shift => {
    let startMinutes, endMinutes;
    
    if (shift.isCustom) {
      startMinutes = getTimeInMinutes(shift.customStartTime);
      endMinutes = getTimeInMinutes(shift.customEndTime);
    } else {
      const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
      if (!shiftType) return null;
      startMinutes = getTimeInMinutes(shiftType.startTime);
      endMinutes = getTimeInMinutes(shiftType.endTime);
    }
    
    // Behandle Schichten über Mitternacht
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const position = calculateShiftPosition(shift, shiftTypes);
    if (!position) return null;
    
    return {
      ...shift,
      startMinutes,
      endMinutes,
      top: position.top,
      height: position.height,
      column: 0
    };
  }).filter(Boolean);
  
  // Sortiere nach Startzeit
  shiftsWithTimes.sort((a, b) => a.startMinutes - b.startMinutes);
  
  // Finde überlappende Schichten und weise Spalten zu
  let maxColumn = 0;
  
  shiftsWithTimes.forEach((shift, i) => {
    shift.column = 0;
    
    // Prüfe Überlappungen mit vorherigen Schichten
    for (let j = 0; j < i; j++) {
      const otherShift = shiftsWithTimes[j];
      
      // Wenn Überlappung, erhöhe die Spalte
      if (shift.startMinutes < otherShift.endMinutes) {
        if (shift.column <= otherShift.column) {
          shift.column = otherShift.column + 1;
        }
      }
    }
    
    maxColumn = Math.max(maxColumn, shift.column);
  });

  // Berechne die endgültigen Positionen
  shiftsWithTimes.forEach(shift => {
    const columnWidth = 100 / (maxColumn + 1);
    shift.width = `${columnWidth}%`;
    shift.left = `${shift.column * columnWidth}%`;
  });
  
  return shiftsWithTimes;
};

// Hilfsfunktion zum Extrahieren des Datums aus der Kalenderwoche
const getDateFromWeek = (weekString, dayIndex) => {
  // Extrahiere das Startdatum aus dem weekString (z.B. "KW 21 (19.05 - 25.05.2025)")
  const match = weekString.match(/\((\d{2}\.\d{2})\s*-\s*\d{2}\.\d{2}\.(\d{4})\)/);
  if (!match) return '';

  const [startDay, startMonth] = match[1].split('.').map(Number);
  const year = match[2];

  // Erstelle das Datum für den ersten Tag der Woche
  const date = new Date(year, startMonth - 1, startDay);
  
  // Addiere die Tage entsprechend dem Index
  date.setDate(date.getDate() + dayIndex);

  // Formatiere das Datum
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

function WeekView({ employees, shiftTypes, scheduleData, setScheduleData, isEditable = false }) {
  const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const timeSlots = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                     '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  

  const [weeks] = useState([
    // 2025
    'KW 01 (30.12.2024 - 05.01.2025)',
    'KW 02 (06.01 - 12.01.2025)',
    'KW 03 (13.01 - 19.01.2025)',
    'KW 04 (20.01 - 26.01.2025)',
    'KW 05 (27.01 - 02.02.2025)',
    'KW 06 (03.02 - 09.02.2025)',
    'KW 07 (10.02 - 16.02.2025)',
    'KW 08 (17.02 - 23.02.2025)',
    'KW 09 (24.02 - 02.03.2025)',
    'KW 10 (03.03 - 09.03.2025)',
    'KW 11 (10.03 - 16.03.2025)',
    'KW 12 (17.03 - 23.03.2025)',
    'KW 13 (24.03 - 30.03.2025)',
    'KW 14 (31.03 - 06.04.2025)',
    'KW 15 (07.04 - 13.04.2025)',
    'KW 16 (14.04 - 20.04.2025)',
    'KW 17 (21.04 - 27.04.2025)',
    'KW 18 (28.04 - 04.05.2025)',
    'KW 19 (05.05 - 11.05.2025)',
    'KW 20 (12.05 - 18.05.2025)',
    'KW 21 (19.05 - 25.05.2025)',
    'KW 22 (26.05 - 01.06.2025)',
    'KW 23 (02.06 - 08.06.2025)',
    'KW 24 (09.06 - 15.06.2025)',
    'KW 25 (16.06 - 22.06.2025)',
    'KW 26 (23.06 - 29.06.2025)',
    'KW 27 (30.06 - 06.07.2025)',
    'KW 28 (07.07 - 13.07.2025)',
    'KW 29 (14.07 - 20.07.2025)',
    'KW 30 (21.07 - 27.07.2025)',
    'KW 31 (28.07 - 03.08.2025)',
    'KW 32 (04.08 - 10.08.2025)',
    'KW 33 (11.08 - 17.08.2025)',
    'KW 34 (18.08 - 24.08.2025)',
    'KW 35 (25.08 - 31.08.2025)',
    'KW 36 (01.09 - 07.09.2025)',
    'KW 37 (08.09 - 14.09.2025)',
    'KW 38 (15.09 - 21.09.2025)',
    'KW 39 (22.09 - 28.09.2025)',
    'KW 40 (29.09 - 05.10.2025)',
    'KW 41 (06.10 - 12.10.2025)',
    'KW 42 (13.10 - 19.10.2025)',
    'KW 43 (20.10 - 26.10.2025)',
    'KW 44 (27.10 - 02.11.2025)',
    'KW 45 (03.11 - 09.11.2025)',
    'KW 46 (10.11 - 16.11.2025)',
    'KW 47 (17.11 - 23.11.2025)',
    'KW 48 (24.11 - 30.11.2025)',
    'KW 49 (01.12 - 07.12.2025)',
    'KW 50 (08.12 - 14.12.2025)',
    'KW 51 (15.12 - 21.12.2025)',
    'KW 52 (22.12 - 28.12.2025)',
    'KW 53 (29.12.2025 - 04.01.2026)',
    
    // 2026
    'KW 01 (05.01 - 11.01.2026)',
    'KW 02 (12.01 - 18.01.2026)',
    'KW 03 (19.01 - 25.01.2026)',
    'KW 04 (26.01 - 01.02.2026)',
    'KW 05 (02.02 - 08.02.2026)',
    'KW 06 (09.02 - 15.02.2026)',
    'KW 07 (16.02 - 22.02.2026)',
    'KW 08 (23.02 - 01.03.2026)',
    'KW 09 (02.03 - 08.03.2026)',
    'KW 10 (09.03 - 15.03.2026)',
    'KW 11 (16.03 - 22.03.2026)',
    'KW 12 (23.03 - 29.03.2026)',
    'KW 13 (30.03 - 05.04.2026)',
    'KW 14 (06.04 - 12.04.2026)',
    'KW 15 (13.04 - 19.04.2026)',
    'KW 16 (20.04 - 26.04.2026)',
    'KW 17 (27.04 - 03.05.2026)',
    'KW 18 (04.05 - 10.05.2026)',
    'KW 19 (11.05 - 17.05.2026)',
    'KW 20 (18.05 - 24.05.2026)',
    'KW 21 (25.05 - 31.05.2026)',
    'KW 22 (01.06 - 07.06.2026)',
    'KW 23 (08.06 - 14.06.2026)',
    'KW 24 (15.06 - 21.06.2026)',
    'KW 25 (22.06 - 28.06.2026)',
    'KW 26 (29.06 - 05.07.2026)',
    'KW 27 (06.07 - 12.07.2026)',
    'KW 28 (13.07 - 19.07.2026)',
    'KW 29 (20.07 - 26.07.2026)',
    'KW 30 (27.07 - 02.08.2026)',
    'KW 31 (03.08 - 09.08.2026)',
    'KW 32 (10.08 - 16.08.2026)',
    'KW 33 (17.08 - 23.08.2026)',
    'KW 34 (24.08 - 30.08.2026)',
    'KW 35 (31.08 - 06.09.2026)',
    'KW 36 (07.09 - 13.09.2026)',
    'KW 37 (14.09 - 20.09.2026)',
    'KW 38 (21.09 - 27.09.2026)',
    'KW 39 (28.09 - 04.10.2026)',
    'KW 40 (05.10 - 11.10.2026)',
    'KW 41 (12.10 - 18.10.2026)',
    'KW 42 (19.10 - 25.10.2026)',
    'KW 43 (26.10 - 01.11.2026)',
    'KW 44 (02.11 - 08.11.2026)',
    'KW 45 (09.11 - 15.11.2026)',
    'KW 46 (16.11 - 22.11.2026)',
    'KW 47 (23.11 - 29.11.2026)',
    'KW 48 (30.11 - 06.12.2026)',
    'KW 49 (07.12 - 13.12.2026)',
    'KW 50 (14.12 - 20.12.2026)',
    'KW 51 (21.12 - 27.12.2026)',
    'KW 52 (28.12.2026 - 03.01.2027)',

    // 2027
    'KW 01 (04.01 - 10.01.2027)',
    'KW 02 (11.01 - 17.01.2027)',
    'KW 03 (18.01 - 24.01.2027)',
    'KW 04 (25.01 - 31.01.2027)',
    'KW 05 (01.02 - 07.02.2027)',
    'KW 06 (08.02 - 14.02.2027)',
    'KW 07 (15.02 - 21.02.2027)',
    'KW 08 (22.02 - 28.02.2027)',
    'KW 09 (01.03 - 07.03.2027)',
    'KW 10 (08.03 - 14.03.2027)',
    'KW 11 (15.03 - 21.03.2027)',
    'KW 12 (22.03 - 28.03.2027)',
    'KW 13 (29.03 - 04.04.2027)',
    'KW 14 (05.04 - 11.04.2027)',
    'KW 15 (12.04 - 18.04.2027)',
    'KW 16 (19.04 - 25.04.2027)',
    'KW 17 (26.04 - 02.05.2027)',
    'KW 18 (03.05 - 09.05.2027)',
    'KW 19 (10.05 - 16.05.2027)',
    'KW 20 (17.05 - 23.05.2027)',
    'KW 21 (24.05 - 30.05.2027)',
    'KW 22 (31.05 - 06.06.2027)',
    'KW 23 (07.06 - 13.06.2027)',
    'KW 24 (14.06 - 20.06.2027)',
    'KW 25 (21.06 - 27.06.2027)',
    'KW 26 (28.06 - 04.07.2027)',
    'KW 27 (05.07 - 11.07.2027)',
    'KW 28 (12.07 - 18.07.2027)',
    'KW 29 (19.07 - 25.07.2027)',
    'KW 30 (26.07 - 01.08.2027)',
    'KW 31 (02.08 - 08.08.2027)',
    'KW 32 (09.08 - 15.08.2027)',
    'KW 33 (16.08 - 22.08.2027)',
    'KW 34 (23.08 - 29.08.2027)',
    'KW 35 (30.08 - 05.09.2027)',
    'KW 36 (06.09 - 12.09.2027)',
    'KW 37 (13.09 - 19.09.2027)',
    'KW 38 (20.09 - 26.09.2027)',
    'KW 39 (27.09 - 03.10.2027)',
    'KW 40 (04.10 - 10.10.2027)',
    'KW 41 (11.10 - 17.10.2027)',
    'KW 42 (18.10 - 24.10.2027)',
    'KW 43 (25.10 - 31.10.2027)',
    'KW 44 (01.11 - 07.11.2027)',
    'KW 45 (08.11 - 14.11.2027)',
    'KW 46 (15.11 - 21.11.2027)',
    'KW 47 (22.11 - 28.11.2027)',
    'KW 48 (29.11 - 05.12.2027)',
    'KW 49 (06.12 - 12.12.2027)',
    'KW 50 (13.12 - 19.12.2027)',
    'KW 51 (20.12 - 26.12.2027)',
    'KW 52 (27.12.2027 - 02.01.2028)',

    // 2028
    'KW 01 (03.01 - 09.01.2028)',
    'KW 02 (10.01 - 16.01.2028)',
    'KW 03 (17.01 - 23.01.2028)',
    'KW 04 (24.01 - 30.01.2028)',
    'KW 05 (31.01 - 06.02.2028)',
    'KW 06 (07.02 - 13.02.2028)',
    'KW 07 (14.02 - 20.02.2028)',
    'KW 08 (21.02 - 27.02.2028)',
    'KW 09 (28.02 - 05.03.2028)',
    'KW 10 (06.03 - 12.03.2028)',
    'KW 11 (13.03 - 19.03.2028)',
    'KW 12 (20.03 - 26.03.2028)',
    'KW 13 (27.03 - 02.04.2028)',
    'KW 14 (03.04 - 09.04.2028)',
    'KW 15 (10.04 - 16.04.2028)',
    'KW 16 (17.04 - 23.04.2028)',
    'KW 17 (24.04 - 30.04.2028)',
    'KW 18 (01.05 - 07.05.2028)',
    'KW 19 (08.05 - 14.05.2028)',
    'KW 20 (15.05 - 21.05.2028)',
    'KW 21 (22.05 - 28.05.2028)',
    'KW 22 (29.05 - 04.06.2028)',
    'KW 23 (05.06 - 11.06.2028)',
    'KW 24 (12.06 - 18.06.2028)',
    'KW 25 (19.06 - 25.06.2028)',
    'KW 26 (26.06 - 02.07.2028)',
    'KW 27 (03.07 - 09.07.2028)',
    'KW 28 (10.07 - 16.07.2028)',
    'KW 29 (17.07 - 23.07.2028)',
    'KW 30 (24.07 - 30.07.2028)',
    'KW 31 (31.07 - 06.08.2028)',
    'KW 32 (07.08 - 13.08.2028)',
    'KW 33 (14.08 - 20.08.2028)',
    'KW 34 (21.08 - 27.08.2028)',
    'KW 35 (28.08 - 03.09.2028)',
    'KW 36 (04.09 - 10.09.2028)',
    'KW 37 (11.09 - 17.09.2028)',
    'KW 38 (18.09 - 24.09.2028)',
    'KW 39 (25.09 - 01.10.2028)',
    'KW 40 (02.10 - 08.10.2028)',
    'KW 41 (09.10 - 15.10.2028)',
    'KW 42 (16.10 - 22.10.2028)',
    'KW 43 (23.10 - 29.10.2028)',
    'KW 44 (30.10 - 05.11.2028)',
    'KW 45 (06.11 - 12.11.2028)',
    'KW 46 (13.11 - 19.11.2028)',
    'KW 47 (20.11 - 26.11.2028)',
    'KW 48 (27.11 - 03.12.2028)',
    'KW 49 (04.12 - 10.12.2028)',
    'KW 50 (11.12 - 17.12.2028)',
    'KW 51 (18.12 - 24.12.2028)',
    'KW 52 (25.12 - 31.12.2028)'
  ]);
  
  const [selectedWeek, setSelectedWeek] = useState('KW 21 (19.05 - 25.05.2025)');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [modalData, setModalData] = useState({ day: '', time: '' });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  // Füge einen Click-Handler zum Hintergrund hinzu
  useEffect(() => {
    const handleBackgroundClick = (e) => {
      // Prüfe, ob das geklickte Element oder seine Eltern die Klasse 'shift-card' haben
      let target = e.target;
      while (target) {
        if (target.classList && target.classList.contains('shift-card')) {
          return;
        }
        target = target.parentElement;
      }
      setSelectedShiftId(null);
    };

    document.addEventListener('click', handleBackgroundClick);
    return () => {
      document.removeEventListener('click', handleBackgroundClick);
    };
  }, []);

  // Hilfsfunktion zur Prüfung von Schichtüberlappungen für einen Mitarbeiter
  const checkEmployeeAvailability = (employeeId, newShift, currentShiftId = null) => {
    if (!scheduleData[selectedWeek]?.[modalData.day]) return { available: true };
    
    // Startzeit und Endzeit der neuen Schicht
    let newStartMinutes, newEndMinutes;
    
    if (newShift.isCustom) {
      if (!newShift.customStartTime || !newShift.customEndTime) return { available: true };
      newStartMinutes = getTimeInMinutes(newShift.customStartTime);
      newEndMinutes = getTimeInMinutes(newShift.customEndTime);
    } else {
      const shiftType = shiftTypes.find(t => t.id === newShift.shiftTypeId);
      if (!shiftType?.startTime || !shiftType?.endTime) return { available: true };
      newStartMinutes = getTimeInMinutes(shiftType.startTime);
      newEndMinutes = getTimeInMinutes(shiftType.endTime);
    }

    if (newEndMinutes < newStartMinutes) {
      newEndMinutes += 24 * 60; // Füge 24 Stunden hinzu für Schichten über Mitternacht
    }

    // Überprüfe alle existierenden Schichten des Tages
    const existingShifts = Object.values(scheduleData[selectedWeek][modalData.day])
      .flat()
      .filter(shift => shift.id !== currentShiftId);

    for (const shift of existingShifts) {
      // Prüfe, ob der Mitarbeiter in dieser Schicht eingeteilt ist
      const isEmployeeInShift = shift.isCustom
        ? shift.customEmployeeIds?.includes(employeeId)
        : shift.employeeId === employeeId;

      if (!isEmployeeInShift) continue;

      // Berechne Start- und Endzeit der existierenden Schicht
      let existingStartMinutes, existingEndMinutes;
      
      if (shift.isCustom) {
        if (!shift.customStartTime || !shift.customEndTime) continue;
        existingStartMinutes = getTimeInMinutes(shift.customStartTime);
        existingEndMinutes = getTimeInMinutes(shift.customEndTime);
      } else {
        const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
        if (!shiftType?.startTime || !shiftType?.endTime) continue;
        existingStartMinutes = getTimeInMinutes(shiftType.startTime);
        existingEndMinutes = getTimeInMinutes(shiftType.endTime);
      }

      if (existingEndMinutes < existingStartMinutes) {
        existingEndMinutes += 24 * 60; // Füge 24 Stunden hinzu für Schichten über Mitternacht
      }

      // Prüfe auf Überlappung
      if (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      ) {
        const employee = employees.find(e => e.id === employeeId);
        return {
          available: false,
          employee: employee,
          conflictingShift: shift
        };
      }
    }

    return { available: true };
  };

  // Hilfsfunktion zur Prüfung von doppelten Schichten
  const checkDuplicateShifts = (day, shiftTypeId, currentShiftId = null) => {
    if (!scheduleData[selectedWeek]?.[day]) return false;
    
    const existingShifts = Object.values(scheduleData[selectedWeek][day])
      .flat()
      .filter(shift => !shift.isCustom && shift.id !== currentShiftId);

    return existingShifts.some(shift => shift.shiftTypeId === shiftTypeId);
  };

  // Schicht-Funktionen
  const handleAddShift = (day, time) => {
    setModalData({ day, time });
    setCurrentShift(null);
    setModalOpen(true);
  };
  

  
  const handleSaveShift = (shiftData) => {
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
    if (!isCustom && checkDuplicateShifts(date, parseInt(shiftTypeId), currentShift?.id)) {
      const shiftType = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
      alert(`Diese Schicht (${shiftType?.name}) wurde bereits für diesen Tag vergeben!`);
      return;
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
        currentShift?.id
      );

      if (!availability.available) {
        const conflictingShiftType = availability.conflictingShift.isCustom 
          ? null 
          : shiftTypes.find(t => t.id === availability.conflictingShift.shiftTypeId);

        alert(`${availability.employee.name} ist bereits in einer anderen Schicht eingeteilt:\n` +
          `${availability.conflictingShift.isCustom 
            ? availability.conflictingShift.customTitle 
            : conflictingShiftType?.name
          } (${availability.conflictingShift.isCustom 
            ? `${availability.conflictingShift.customStartTime} - ${availability.conflictingShift.customEndTime}`
            : `${conflictingShiftType?.startTime} - ${conflictingShiftType?.endTime}`
          })`);
        return;
      }
    }
    
    let newShift;
    
    if (isCustom) {
      // Stelle sicher, dass die IDs als Zahlen gespeichert werden
      const employeeIdsAsNumbers = (customEmployeeIds || []).map(id => parseInt(id));
      const mainEmployee = employees.find(e => e.id === employeeIdsAsNumbers[0]);
      
      newShift = {
        id: currentShift ? currentShift.id : Date.now(),
        isCustom: true,
        customTitle,
        customStartTime,
        customEndTime,
        customColor,
        customEmployeeIds: employeeIdsAsNumbers,
        notes,
        type: customColor,
        name: mainEmployee ? mainEmployee.name : customTitle
      };
    } else {
      const employee = employees.find(e => e.id === parseInt(employeeId));
      const shiftType = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
      
      if (!employee || !shiftType) return;
      
      newShift = {
        id: currentShift ? currentShift.id : Date.now(),
        employeeId: parseInt(employeeId),
        name: employee.name,
        shiftTypeId: parseInt(shiftTypeId),
        task: shiftType.name,
        type: shiftType.color,
        notes,
        isCustom: false
      };
    }
    
    setScheduleData(prev => {
      const newData = { ...prev };
      
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
    });
    
    setModalOpen(false);
    setCurrentShift(null);
  };
  
  const handleDeleteShift = (day, time, shiftId) => {
    setScheduleData(prev => {
      const newData = { ...prev };
      
      // Wenn es sich um einen Urlaubs- oder Krankheitseintrag handelt, 
      // oder wir in der Tagesansicht sind,
      // müssen wir in allen Zeitslots des Tages suchen
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
    });
  };
  
  // Navigation
  const goToPreviousWeek = () => {
    const currentIndex = weeks.indexOf(selectedWeek);
    if (currentIndex > 0) setSelectedWeek(weeks[currentIndex - 1]);
  };
  
  const goToNextWeek = () => {
    const currentIndex = weeks.indexOf(selectedWeek);
    if (currentIndex < weeks.length - 1) setSelectedWeek(weeks[currentIndex + 1]);
  };

  // Hilfsfunktion zum Filtern der Schichten nach Mitarbeiter
  const filterShiftsByEmployee = (shifts) => {
    if (!selectedEmployee) return shifts;
    
    return shifts.filter(shift => {
      if (shift.isCustom) {
        return shift.customEmployeeIds?.includes(parseInt(selectedEmployee));
      }
      return shift.employeeId === parseInt(selectedEmployee);
    });
  };

  // Export-Funktionen
  const handleExport = () => {
    let csvContent = "Zeit;";
    days.forEach(day => csvContent += `${day};`);
    csvContent += "\n";
    
    timeSlots.forEach(time => {
      csvContent += `${time};`;
      days.forEach(day => {
        if (scheduleData[selectedWeek]?.[day]?.[time]) {
          const shifts = scheduleData[selectedWeek][day][time];
          const cellContent = shifts.map(shift => 
            `${shift.name} (${shift.task})${shift.notes ? ` - ${shift.notes}` : ''}`
          ).join(" / ");
          csvContent += `"${cellContent}";`;
        } else {
          csvContent += ";";
        }
      });
      csvContent += "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Dienstplan_${selectedWeek.replace(/\s/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePdfExport = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFontSize(16);
    doc.text(`Dienstplan ${selectedWeek}`, 14, 15);
    
    const tableHeaders = ['Zeit', ...days];
    const tableData = timeSlots.map(time => {
      const row = [time];
      days.forEach(day => {
        if (scheduleData[selectedWeek]?.[day]?.[time]) {
          const shifts = scheduleData[selectedWeek][day][time];
          const cellContent = shifts.map(shift => 
            `${shift.name} (${shift.task})${shift.notes ? `\n↪ ${shift.notes}` : ''}`
          ).join("\n");
          row.push(cellContent);
        } else {
          row.push('');
        }
      });
      return row;
    });
    
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 20,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: { 
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: { 
        0: { cellWidth: 15 }
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245]
      },
      theme: 'grid',
      margin: { top: 20, right: 14, bottom: 20, left: 14 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index > 0) {
          const text = data.cell.text.join('');
          if (text.includes('Frühdienst')) {
            data.cell.styles.fillColor = [219, 234, 254];
          } else if (text.includes('Tagesdienst')) {
            data.cell.styles.fillColor = [220, 252, 231];
          } else if (text.includes('Spätdienst')) {
            data.cell.styles.fillColor = [243, 232, 255];
          } else if (text.includes('Nachtdienst')) {
            data.cell.styles.fillColor = [229, 231, 235];
          } else if (text.includes('Kochen')) {
            data.cell.styles.fillColor = [254, 226, 226];
          } else if (text.includes('Wochenende')) {
            data.cell.styles.fillColor = [254, 249, 195];
          }
        }
      }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const today = new Date().toLocaleDateString('de-DE');
      doc.setFontSize(8);
      doc.text(`Erstellt am: ${today} | Seite ${i} von ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    }
    
    doc.save(`Dienstplan_${selectedWeek.replace(/\s/g, '_')}.pdf`);
  };

  // Aktualisiere die renderShiftCard Funktion für die Wochenansicht
  const renderWeekViewShift = (shift, day, time) => {
    const isSelected = selectedShiftId === shift.id;
    const shiftStyle = {
      position: 'absolute',
      top: `${shift.top}px`,
      height: `${shift.height}px`,
      width: shift.width,
      left: shift.left
    };
    
    if (shift.isCustom) {
      const isAbsence = shift.type === 'vacation' || shift.type === 'sick';
      const cardClassName = `shift-card custom-entry shift-${shift.type} ${isAbsence ? 'absence-entry' : ''} ${isSelected ? 'selected' : ''}`;

      return (
        <div
          key={shift.id}
          className={cardClassName}
          style={shiftStyle}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedShiftId(shift.id);
            if (isEditable) {
              setCurrentShift(shift);
              setModalData({ day, time });
              setModalOpen(true);
            }
          }}
        >
          <div className="shift-header">
            <div className="shift-type">
              {isAbsence ? (
                shift.type === 'vacation' ? 'Urlaub' : 'Krank'
              ) : shift.customTitle}
            </div>
            <div className="shift-employee">
              {shift.customEmployeeIds ? 
                shift.customEmployeeIds.map(empId => {
                  const employee = employees.find(e => e.id === parseInt(empId));
                  return employee ? employee.name : '';
                }).join(', ') : 
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

    // Reguläre Schicht
    const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
    if (!shiftType) return null;

    return (
      <div
        key={shift.id}
        className={`shift-card shift-${shiftType.color || 'gray'} ${isSelected ? 'selected' : ''}`}
        style={shiftStyle}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedShiftId(shift.id);
          if (isEditable) {
            setCurrentShift(shift);
            setModalData({ day, time });
            setModalOpen(true);
          }
        }}
      >
        <div className="shift-header">
          <div className="shift-type">{shiftType.name}</div>
          <div className="shift-employee">{shift.name}</div>
          {shift.notes && (
            <div className="shift-notes">{shift.notes}</div>
          )}
        </div>
      </div>
    );
  };

  // Render der Filterauswahl
  const renderEmployeeFilter = () => (
    <div className="employee-filter">
      <select
        className="filter-select"
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
      >
        <option value="">Alle Mitarbeiter</option>
        {employees.map(employee => (
          <option key={employee.id} value={employee.id}>
            {employee.name}
          </option>
        ))}
      </select>
    </div>
  );

  // Render
  return (
    <div className="card">
      <div className="card-header">
        <div className="title-container">
          <h2 className="card-title">Übersicht</h2>
        </div>
        <div className="card-actions">
          {renderEmployeeFilter()}
          <div className="week-navigation">
            <button
              className="week-nav-button"
              onClick={goToPreviousWeek}
              disabled={weeks.indexOf(selectedWeek) === 0}
            >◀</button>
            <select
              className="select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {weeks.map((week) => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
            <button
              className="week-nav-button"
              onClick={goToNextWeek}
              disabled={weeks.indexOf(selectedWeek) === weeks.length - 1}
            >▶</button>
          </div>
          {isEditable && (
            <div className="export-buttons">
              <button className="button" onClick={handleExport}>CSV</button>
              <button className="button" onClick={handlePdfExport}>PDF</button>
            </div>
          )}
        </div>
      </div>

      <div className="schedule-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="schedule-header time-column">Zeit</th>
              {days.map((day, index) => (
                <th key={day} className="schedule-header">
                  <div className="day-header">
                    <div className="day-name">{day}</div>
                    <div className="day-date">{getDateFromWeek(selectedWeek, index)}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, index) => (
              <tr key={time} className="schedule-row">
                <td className="schedule-time">{time}</td>
                {days.map((day) => (
                  <td key={`${day}-${time}`} className="schedule-cell">
                    {index === 0 && scheduleData[selectedWeek]?.[day] && (
                      <div className="day-container">
                        {organizeOverlappingShifts(
                          filterShiftsByEmployee(
                            Object.values(scheduleData[selectedWeek][day])
                              .flat()
                              .filter((shift, index, self) => 
                                index === self.findIndex(s => s.id === shift.id)
                              )
                          ),
                          shiftTypes
                        ).map(shift => renderWeekViewShift(shift, day, time))}
                      </div>
                    )}
                    {isEditable && (
                      <button 
                        className="add-shift-button" 
                        onClick={() => handleAddShift(day, time)}
                      >+</button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      {isEditable && (
        <Modal 
          isOpen={modalOpen} 
          onClose={() => {
            setModalOpen(false);
            setSelectedShiftId(null);
          }}
          title={currentShift ? "Schicht bearbeiten" : "Schicht hinzufügen"}
        >
          <div className="modal-content">
            <ShiftAssignmentForm 
              date={modalData.day}
              time={modalData.time}
              employees={employees}
              shiftTypes={shiftTypes}
              existingShift={currentShift}
              onSave={handleSaveShift}
              onCancel={() => {
                setModalOpen(false);
                setSelectedShiftId(null);
              }}
            />
            {currentShift && (
              <div className="modal-footer">
                <button
                  className="button delete"
                  onClick={() => {
                    if (window.confirm('Möchten Sie diese Schicht wirklich löschen?')) {
                      handleDeleteShift(modalData.day, modalData.time, currentShift.id);
                      setModalOpen(false);
                      setSelectedShiftId(null);
                    }
                  }}
                >
                  Schicht löschen
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default WeekView;