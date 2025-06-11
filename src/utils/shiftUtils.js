import { formatDate, normalizeDateForComparison } from './dateUtils';
import { 
  jsToISODay, 
  getDayNameFromJS, 
  getDayIndexFromName,
  getMonday
} from './dayUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { DAYS_OF_WEEK } from '../constants/dateFormats';

// Cache für getTimeInMinutes
const timeCache = new Map();

// Hilfsfunktion zur Umrechnung der Zeit in Minuten
export const getTimeInMinutes = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  
  // Check cache first
  if (timeCache.has(timeString)) {
    return timeCache.get(timeString);
  }
  
  const [hours, minutes] = timeString.split(':').map(Number);
  const result = hours * 60 + minutes;
  timeCache.set(timeString, result);
  return result;
};

// Hilfsfunktion zur Berechnung der Position einer Schicht
export const calculateShiftPosition = (shift, shiftTypes) => {
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

  return { top, height, startMinutes, endMinutes };
};

// Hilfsfunktion für die Berechnung von Schichtüberlappungen
export const organizeOverlappingShifts = (shifts, shiftTypes, timeSlots) => {
  if (!shifts || shifts.length === 0) return [];

  const timelineStart = getTimeInMinutes('7:00');
  const timelineEnd = getTimeInMinutes('21:00');

  // Berechne Positionen für alle Schichten in einem Durchgang
  const shiftsWithTimes = shifts
    .map(shift => {
      let position;
      
      if (shift.isCustom && (shift.type === 'vacation' || shift.type === 'sick')) {
        // Für Urlaub und Krankheit: Beschränke auf sichtbaren Zeitraum
        position = {
          top: 0, // Starte bei der ersten sichtbaren Stunde (7:00)
          height: ((timelineEnd - timelineStart) / 60) * 60 + 60, // Höhe für den gesamten sichtbaren Bereich + 1 Stunde für die letzte Zelle
          startMinutes: timelineStart,
          endMinutes: timelineEnd + 60 // Eine Stunde hinzufügen, um die letzte Zelle einzuschließen
        };
      } else {
        position = calculateShiftPosition(shift, shiftTypes);
      }
      
      if (!position) return null;
      
      return {
        ...shift,
        ...position,
        column: 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  // Optimierte Überlappungserkennung mit Sweep-Line-Algorithmus
  const activeShifts = [];
  let maxColumn = 0;

  shiftsWithTimes.forEach(currentShift => {
    // Entferne nicht mehr aktive Schichten
    while (
      activeShifts.length > 0 && 
      activeShifts[0].endMinutes <= currentShift.startMinutes
    ) {
      activeShifts.shift();
    }

    // Finde die erste freie Spalte
    let column = 0;
    const usedColumns = new Set(activeShifts.map(s => s.column));
    while (usedColumns.has(column)) {
      column++;
    }

    currentShift.column = column;
    maxColumn = Math.max(maxColumn, column);

    // Füge aktuelle Schicht sortiert ein
    let insertIndex = activeShifts.findIndex(s => s.endMinutes > currentShift.endMinutes);
    if (insertIndex === -1) {
      activeShifts.push(currentShift);
    } else {
      activeShifts.splice(insertIndex, 0, currentShift);
    }
  });

  // Berechne finale Positionen
  const columnWidth = 100 / (maxColumn + 1);
  shiftsWithTimes.forEach(shift => {
    shift.width = `${columnWidth}%`;
    shift.left = `${shift.column * columnWidth}%`;
  });

  return shiftsWithTimes;
};

// Hilfsfunktion zur Prüfung von Schichtüberlappungen für einen Mitarbeiter
export const checkEmployeeAvailability = (employeeId, newShift, currentShiftId, scheduleData, selectedWeek, day, shiftTypes) => {
  if (!scheduleData || !selectedWeek || !scheduleData[selectedWeek] || !scheduleData[selectedWeek][day]) {
    return { available: true };
  }

  const existingShifts = [];
  const dayData = scheduleData[selectedWeek][day];

  // Sammle alle Schichten für diesen Tag
  Object.values(dayData).forEach(shifts => {
    shifts.forEach(shift => {
      if (shift.id !== currentShiftId) {
        existingShifts.push(shift);
      }
    });
  });

  // Bestimme Start- und Endzeit der neuen Schicht
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
    newEndMinutes += 24 * 60;
  }

  // Überprüfe Überschneidungen mit existierenden Schichten
  for (const shift of existingShifts) {
    const isEmployeeInShift = shift.isCustom
      ? shift.customEmployeeIds?.includes(parseInt(employeeId))
      : parseInt(shift.employeeId) === parseInt(employeeId);

    if (!isEmployeeInShift) continue;

    // Wenn der Mitarbeiter bereits Urlaub oder krank ist, ist er nicht verfügbar
    if (shift.isCustom && (shift.type === 'vacation' || shift.type === 'sick')) {
      return {
        available: false,
        conflictingShift: shift,
        employee: { id: employeeId },
        reason: shift.type === 'vacation' ? 'Urlaub' : 'Krankmeldung'
      };
    }

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
      existingEndMinutes += 24 * 60;
    }

    if (
      (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
      (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
      (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
    ) {
      return {
        available: false,
        conflictingShift: shift,
        employee: { id: employeeId }
      };
    }
  }

  return { available: true };
};

// Hilfsfunktion zur Prüfung von doppelten Schichten
export const checkDuplicateShifts = (day, shiftTypeId, currentShiftId, scheduleData, selectedWeek) => {
  if (!scheduleData[selectedWeek]?.[day]) return false;
  
  const existingShifts = Object.values(scheduleData[selectedWeek][day])
    .flat()
    .filter(shift => !shift.isCustom && shift.id !== currentShiftId);

  return existingShifts.some(shift => shift.shiftTypeId === shiftTypeId);
};

// Hilfsfunktion zum Extrahieren des Datums aus der Kalenderwoche
export const getDateFromWeek = (weekString, dayIndex) => {
  try {
    const dateMatch = weekString.match(/\((\d{2})\.(\d{2})\s*-\s*\d{2}\.\d{2}\.(\d{4})\)/);
    if (!dateMatch) return null;
    
    const [, day, month, year] = dateMatch;
    const monday = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
    
    const normalizedDayIndex = dayIndex % 7;
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + normalizedDayIndex);
    
    return formatDate(targetDate);
  } catch (error) {
    return null;
  }
};

// Hilfsfunktion zum Ermitteln der aktuellen Kalenderwoche im gewünschten Format
export const getCurrentWeek = () => {
  // Für Testzwecke: Setze das aktuelle Datum auf den 06.06.2025
  const now = new Date(2025, 5, 6); // Monate sind 0-basiert, daher 5 für Juni
  
  // Montag dieser Woche finden
  const monday = getMonday(now);
  
  // Sonntag dieser Woche finden
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  // Kalenderwoche berechnen
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((monday - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  
  // Format: "KW XX (DD.MM - DD.MM.YYYY)" - exakt wie in der weeks-Liste
  const mondayDay = monday.getDate().toString().padStart(2, '0');
  const mondayMonth = (monday.getMonth() + 1).toString().padStart(2, '0');
  const sundayDay = sunday.getDate().toString().padStart(2, '0');
  const sundayMonth = (sunday.getMonth() + 1).toString().padStart(2, '0');
  const year = monday.getFullYear();
  
  return `KW ${weekNumber.toString().padStart(2, '0')} (${mondayDay}.${mondayMonth} - ${sundayDay}.${sundayMonth}.${year})`;
};

// Hilfsfunktion zum Prüfen, ob ein Datum der aktuelle Tag ist
export const isCurrentDay = (dateString) => {
  const today = new Date();
  const [day, month, year] = dateString.split('.').map(Number);
  return today.getDate() === day && 
         today.getMonth() + 1 === month && 
         today.getFullYear() === year;
};

export const createCustomShift = (date, startTime, endTime, employeeIds, title, type) => {
  if (!date || !startTime || !endTime || !employeeIds) return null;
  
  return {
    id: Date.now(),
    isCustom: true,
    customStartTime: startTime,
    customEndTime: endTime,
    customEmployeeIds: employeeIds,
    customTitle: title,
    type: type || 'custom'
  };
}; 