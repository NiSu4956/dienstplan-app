import { format, parse, eachDayOfInterval, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import { DATE_FORMATS } from '../constants/dateFormats';
import { getMonday } from './dayUtils';

export { DATE_FORMATS };

/**
 * Normalisiert ein Datum für konsistente Vergleiche
 */
export const normalizeDateForComparison = (date) => {
  if (!date) return null;
  
  let normalizedDate;
  
  if (date instanceof Date) {
    normalizedDate = new Date(date);
  } else if (typeof date === 'string') {
    normalizedDate = parseAnyDate(date);
  } else {
    return null;
  }
  
  if (!normalizedDate) return null;
  
  // Setze Zeit auf Mitternacht
  normalizedDate.setHours(0, 0, 0, 0);
  
  console.log('DATE_DEBUG Normalisierung:', {
    input: date,
    inputType: typeof date,
    normalized: normalizedDate,
    isoString: normalizedDate.toISOString(),
    weekDay: normalizedDate.getDay(),
    weekDayName: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][normalizedDate.getDay()]
  });
  
  return normalizedDate;
};

/**
 * Formatiert ein Datum in das Format DD.MM.YYYY
 */
export const formatDate = (date) => {
  const normalizedDate = normalizeDateForComparison(date);
  if (!normalizedDate) return '';
  
  const formatted = format(normalizedDate, 'dd.MM.yyyy', { locale: de });
  
  console.log('DATE_DEBUG Formatierung:', {
    input: date,
    normalized: normalizedDate,
    formatted: formatted,
    weekDay: normalizedDate.getDay()
  });
  
  return formatted;
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, `${DATE_FORMATS.DE_SHORT} ${DATE_FORMATS.DE_TIME}`, { locale: de });
};

/**
 * Versucht ein Datum aus verschiedenen Formaten zu parsen
 */
export const parseAnyDate = (dateString) => {
  if (!dateString) return null;
  
  // Wenn bereits ein Date-Objekt
  if (dateString instanceof Date) {
    return isValid(dateString) ? dateString : null;
  }
  
  try {
    // Versuche DD.MM.YYYY Format
    let parsedDate = parse(dateString, 'dd.MM.yyyy', new Date());
    if (isValid(parsedDate)) {
      console.log('DATE_DEBUG Parsing (DE):', {
        input: dateString,
        parsed: parsedDate,
        weekDay: parsedDate.getDay()
      });
      return parsedDate;
    }
    
    // Versuche ISO Format
    parsedDate = new Date(dateString);
    if (isValid(parsedDate)) {
      console.log('DATE_DEBUG Parsing (ISO):', {
        input: dateString,
        parsed: parsedDate,
        weekDay: parsedDate.getDay()
      });
      return parsedDate;
    }
    
    console.log('DATE_DEBUG Parsing fehlgeschlagen:', {
      input: dateString,
      inputType: typeof dateString
    });
    return null;
  } catch (error) {
    console.error('DATE_DEBUG Parsing Error:', {
      input: dateString,
      error: error.message
    });
    return null;
  }
};

export const formatWeekString = (date) => {
  return formatDate(date, DATE_FORMATS.WEEK);
};

export const formatTime = (date) => {
  return formatDate(date, DATE_FORMATS.TIME_24);
};

/**
 * Generiert einen Wochenschlüssel im Format "KW XX (DD.MM - DD.MM.YYYY)"
 */
export const getWeekKey = (date) => {
  const normalizedDate = normalizeDateForComparison(date);
  if (!normalizedDate) return '';
  
  const monday = getMonday(normalizedDate);
  const mondayStr = formatDate(monday);
  
  // Berechne das Ende der Woche (Sonntag)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sundayStr = formatDate(sunday);
  
  // Kalenderwoche berechnen
  const weekNumber = getWeekNumber(monday);
  
  const weekKey = `KW ${weekNumber} (${mondayStr.substring(0, 5)} - ${sundayStr})`;
  
  console.log('DATE_DEBUG WeekKey:', {
    input: date,
    monday: monday,
    sunday: sunday,
    weekKey: weekKey
  });
  
  return weekKey;
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7).toString().padStart(2, '0');
};

export const getCurrentWeekString = () => {
  return getWeekKey(new Date());
};

export const isCurrentDay = (dateString) => {
  const today = new Date();
  const date = parseAnyDate(dateString);
  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  );
};

export const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
};

export const calculateTimeDifference = (startTime, endTime) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // Für Schichten über Mitternacht
  
  return totalMinutes;
};

export const formatTimeRange = (startTime, endTime) => {
  return `${startTime} - ${endTime}`;
};

export const getDatesInRange = (startDate, endDate) => {
  return eachDayOfInterval({ 
    start: typeof startDate === 'string' ? new Date(startDate) : startDate,
    end: typeof endDate === 'string' ? new Date(endDate) : endDate 
  });
};

export const getDateFromWeekString = (weekString) => {
  const match = weekString.match(/KW \d+ \((\d{2}\.\d{2}) - \d{2}\.\d{2}\.(\d{4})\)/);
  if (!match) return null;
  
  const [startDay, startMonth] = match[1].split('.').map(Number);
  const year = parseInt(match[2]);
  
  return new Date(year, startMonth - 1, startDay);
}; 