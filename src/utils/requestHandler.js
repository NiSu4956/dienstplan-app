import { parse, eachDayOfInterval, format } from 'date-fns';
import { de } from 'date-fns/locale';

const REQUEST_TYPES = {
  VACATION: 'vacation',
  SICK: 'sickness'
};

const DATE_FORMATS = {
  DE: 'dd.MM.yyyy',
  ISO: 'yyyy-MM-dd',
  WEEK: "'KW' ww '('dd.MM - dd.MM.yyyy')'",
  DAY: 'EEEE'
};

const CUSTOM_SHIFTS = {
  VACATION: {
    title: '🏖️ Urlaub',
    color: 'blue'
  },
  SICK: {
    title: '🏥 Krank',
    color: 'red'
  }
};

const DAYS_OF_WEEK = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const MAX_REQUEST_DAYS = 30;

const createCustomShift = (request, date, weekNumber) => ({
  id: `${request.id}-${format(date, DATE_FORMATS.ISO)}`,
  type: request.type === REQUEST_TYPES.VACATION ? REQUEST_TYPES.VACATION : REQUEST_TYPES.SICK,
  customTitle: request.type === REQUEST_TYPES.VACATION ? CUSTOM_SHIFTS.VACATION.title : CUSTOM_SHIFTS.SICK.title,
  customStartTime: '00:00',
  customEndTime: '23:59',
  customColor: request.type === REQUEST_TYPES.VACATION ? CUSTOM_SHIFTS.VACATION.color : CUSTOM_SHIFTS.SICK.color,
  isCustom: true,
  customEmployeeIds: [request.employeeId],
  name: request.employeeName,
  notes: request.notes,
  week: weekNumber,
  day: format(date, DATE_FORMATS.DAY, { locale: de })
});

export const createShiftFromRequest = (request) => {
  const startDate = parse(request.startDate, DATE_FORMATS.DE, new Date());
  const endDate = parse(request.endDate, DATE_FORMATS.DE, new Date());
  
  const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  return daysInRange.map(date => {
    const weekNumber = format(date, DATE_FORMATS.WEEK);
    return createCustomShift(request, date, weekNumber);
  });
};

export const handleRequestApproval = (request, scheduleData) => {
  return {
    success: true,
    message: 'Antrag erfolgreich genehmigt'
  };
};

const validateRequestDates = (startDate, endDate) => {
  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
    return {
      isValid: false,
      message: 'Bitte geben Sie gültige Daten ein.'
    };
  }

  if (startDate > endDate) {
    return {
      isValid: false,
      message: 'Das Startdatum muss vor dem Enddatum liegen.'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) {
    return {
      isValid: false,
      message: 'Das Startdatum darf nicht in der Vergangenheit liegen.'
    };
  }

  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays > MAX_REQUEST_DAYS) {
    return {
      isValid: false,
      message: `Die maximale Dauer für einen Antrag beträgt ${MAX_REQUEST_DAYS} Tage.`
    };
  }

  return { isValid: true };
};

const validateVacationConflicts = (request, scheduleData, startDate, endDate) => {
  for (const weekKey in scheduleData) {
    const weekData = scheduleData[weekKey];
    for (const dayKey in weekData) {
      const dayData = weekData[dayKey];
      const currentDate = getDayDateFromWeekAndDay(weekKey, dayKey);
      
      if (!currentDate) continue;
      
      currentDate.setHours(0, 0, 0, 0);
      
      if (currentDate >= startDate && currentDate <= endDate) {
        const hasConflict = checkDayConflicts(dayData, request.employeeId, currentDate);
        if (hasConflict) {
          return {
            isValid: false,
            message: `Sie sind am ${formatDate(currentDate)} bereits für eine Schicht eingeplant. Ein Urlaubsantrag ist für diesen Tag nicht möglich.`
          };
        }
      }
    }
  }
  return { isValid: true };
};

const checkDayConflicts = (dayData, employeeId, date) => {
  for (const timeSlot in dayData) {
    const shifts = dayData[timeSlot];
    for (const shift of shifts) {
      if (!shift.isCustom) {
        const shiftEmployeeId = parseInt(shift.employeeId);
        const requestEmployeeId = parseInt(employeeId);
        
        if (shiftEmployeeId === requestEmployeeId) {
          return true;
        }
      }
    }
  }
  return false;
};

export const validateRequest = (request, scheduleData) => {
  if (!request.startDate || !request.endDate || !request.type || !request.employeeId) {
    return {
      isValid: false,
      message: 'Bitte füllen Sie alle erforderlichen Felder aus.'
    };
  }

  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const dateValidation = validateRequestDates(startDate, endDate);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  if (request.type === REQUEST_TYPES.VACATION && scheduleData) {
    const conflictValidation = validateVacationConflicts(request, scheduleData, startDate, endDate);
    if (!conflictValidation.isValid) {
      return conflictValidation;
    }
  }

  return {
    isValid: true,
    message: ''
  };
};

const formatDate = (date) => {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getDayDateFromWeekAndDay = (weekKey, dayKey) => {
  const weekMatch = weekKey.match(/KW \d+ \((\d{2}\.\d{2}) - \d{2}\.\d{2}\.(\d{4})\)/);
  if (!weekMatch) return null;

  const [startDay, startMonth] = weekMatch[1].split('.').map(Number);
  const year = parseInt(weekMatch[2]);
  const dayIndex = DAYS_OF_WEEK.indexOf(dayKey);
  
  if (dayIndex === -1) return null;
  
  const date = new Date(year, startMonth - 1, startDay);
  date.setDate(date.getDate() + dayIndex);
  return date;
};

export { formatDate, getDayDateFromWeekAndDay }; 