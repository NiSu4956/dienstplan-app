// Cache für Datumsberechnungen
const dateCache = new Map();

export const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
};

export const getDayDateFromWeek = (weekKey, day) => {
  const weekMatch = weekKey.match(/KW \d+ \((\d{2}\.\d{2}) - \d{2}\.\d{2}\.(\d{4})\)/);
  if (!weekMatch) return new Date().toISOString();

  const [startDay, startMonth] = weekMatch[1].split('.').map(Number);
  const year = parseInt(weekMatch[2]);
  const dayIndex = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].indexOf(day);
  
  if (dayIndex === -1) return new Date().toISOString();
  
  const date = new Date(year, startMonth - 1, startDay);
  date.setDate(date.getDate() + dayIndex);
  return date.toISOString();
};

export const getWeekNumber = (date) => {
  const dateString = date.toISOString();
  const cacheKey = `week_${dateString}`;
  
  if (dateCache.has(cacheKey)) {
    return dateCache.get(cacheKey);
  }

  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const result = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  
  dateCache.set(cacheKey, result);
  return result;
};

export const getWeekKey = (date) => {
  const dateString = date.toISOString();
  if (dateCache.has(dateString)) {
    return dateCache.get(dateString);
  }

  const weekNumber = getWeekNumber(date);
  const year = date.getFullYear();
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - date.getDay() + 1);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const formatDate = (d) => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  };

  const key = `KW ${weekNumber} (${formatDate(startDate)} - ${formatDate(endDate)}.${year})`;
  dateCache.set(dateString, key);
  return key;
};

// Neue Hilfsfunktionen für die WeekView-Komponente
export const getShiftTimes = (shift, shiftTypes, timeSlots, time) => {
  if (shift?.isCustom) {
    return `${shift.customStartTime} - ${shift.customEndTime}`;
  }

  const shiftType = shiftTypes.find(t => t.id === shift?.shiftTypeId);
  if (shiftType) {
    return `${shiftType.startTime} - ${shiftType.endTime}`;
  }

  const timeIndex = timeSlots.indexOf(time);
  if (timeIndex >= 0 && timeIndex < timeSlots.length - 1) {
    return `${time} - ${timeSlots[timeIndex + 1]}`;
  }

  return time;
};

export const isUserShift = (shift, currentUser) => {
  if (!currentUser) return false;
  
  return (shift.isCustom && shift.customEmployeeIds?.includes(currentUser.id)) ||
    (!shift.isCustom && shift.employeeId === currentUser.id);
};

export const getEmployeeNames = (shift, employees) => {
  if (!shift.isCustom || !shift.customEmployeeIds) return shift.name;
  
  return shift.customEmployeeIds
    .map(empId => {
      const employee = employees.find(e => e.id === parseInt(empId));
      return employee ? employee.name : '';
    })
    .filter(name => name)
    .join(', ');
}; 