import { format, parse, eachDayOfInterval, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import { DATE_FORMATS } from '../constants/dateFormats';
import { getMonday } from './dayUtils';

export { DATE_FORMATS };

/**
 * Normalisiert ein Datum für konsistente Vergleiche
 * @param {Date|string} date - Das zu normalisierende Datum
 * @returns {Date|null} Das normalisierte Datum oder null bei ungültiger Eingabe
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
  
  if (!normalizedDate || !isValid(normalizedDate)) return null;
  
  // Setze Zeit auf Mitternacht
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

/**
 * Formatiert ein Datum in das Format DD.MM.YYYY
 * @param {Date|string} date - Das zu formatierende Datum
 * @returns {string} Das formatierte Datum oder leerer String bei ungültiger Eingabe
 */
export const formatDate = (date) => {
  const normalizedDate = normalizeDateForComparison(date);
  if (!normalizedDate) return '';
  
  return format(normalizedDate, 'dd.MM.yyyy', { locale: de });
};

/**
 * Formatiert ein Datum mit Uhrzeit
 * @param {Date|string} date - Das zu formatierende Datum
 * @returns {string} Das formatierte Datum mit Uhrzeit oder leerer String bei ungültiger Eingabe
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, `${DATE_FORMATS.DE_SHORT} ${DATE_FORMATS.DE_TIME}`, { locale: de });
};

/**
 * Versucht ein Datum aus verschiedenen Formaten zu parsen
 * @param {string|Date} dateString - Das zu parsende Datum
 * @returns {Date|null} Das geparste Datum oder null bei ungültiger Eingabe
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
      return parsedDate;
    }
    
    // Versuche ISO Format
    parsedDate = new Date(dateString);
    if (isValid(parsedDate)) {
      return parsedDate;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Formatiert ein Datum als Wochenschlüssel
 * @param {Date|string} date - Das zu formatierende Datum
 * @returns {string} Der formatierte Wochenschlüssel
 */
export const formatWeekString = (date) => {
  return formatDate(date, DATE_FORMATS.WEEK);
};

/**
 * Formatiert ein Datum als Uhrzeit
 * @param {Date|string} date - Das zu formatierende Datum
 * @returns {string} Die formatierte Uhrzeit
 */
export const formatTime = (date) => {
  return formatDate(date, DATE_FORMATS.TIME_24);
};

/**
 * Generiert einen Wochenschlüssel im Format "KW XX (DD.MM - DD.MM.YYYY)"
 * @param {Date|string} date - Das Datum für den Wochenschlüssel
 * @returns {string} Der generierte Wochenschlüssel
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
  
  return `KW ${weekNumber} (${mondayStr.substring(0, 5)} - ${sundayStr})`;
};

/**
 * Berechnet die Kalenderwoche für ein Datum
 * @param {Date} date - Das Datum
 * @returns {string} Die Kalenderwoche als zweistellige Zahl
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7).toString().padStart(2, '0');
};

/**
 * Gibt den Wochenschlüssel für die aktuelle Woche zurück
 * @returns {string} Der Wochenschlüssel für die aktuelle Woche
 */
export const getCurrentWeekString = () => {
  return getWeekKey(new Date());
};

/**
 * Prüft, ob ein Datum der aktuelle Tag ist
 * @param {string|Date} dateString - Das zu prüfende Datum
 * @returns {boolean} true wenn das Datum der aktuelle Tag ist
 */
export const isCurrentDay = (dateString) => {
  const today = new Date();
  const date = parseAnyDate(dateString);
  if (!date) return false;
  
  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  );
};

/**
 * Normalisiert ein Datum auf 12:00 Uhr
 * @param {Date|string} date - Das zu normalisierende Datum
 * @returns {Date} Das normalisierte Datum
 */
export const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
};

/**
 * Berechnet die Zeitdifferenz zwischen zwei Uhrzeiten
 * @param {string} startTime - Startzeit im Format "HH:mm"
 * @param {string} endTime - Endzeit im Format "HH:mm"
 * @returns {number} Die Zeitdifferenz in Minuten
 */
export const calculateTimeDifference = (startTime, endTime) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // Für Schichten über Mitternacht
  
  return totalMinutes;
};

/**
 * Formatiert einen Zeitbereich
 * @param {string} startTime - Startzeit im Format "HH:mm"
 * @param {string} endTime - Endzeit im Format "HH:mm"
 * @returns {string} Der formatierte Zeitbereich
 */
export const formatTimeRange = (startTime, endTime) => {
  return `${startTime} - ${endTime}`;
};

/**
 * Gibt alle Tage zwischen zwei Daten zurück
 * @param {Date|string} startDate - Startdatum
 * @param {Date|string} endDate - Enddatum
 * @returns {Date[]} Array mit allen Tagen im Bereich
 */
export const getDatesInRange = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (!isValid(start) || !isValid(end)) return [];
  
  return eachDayOfInterval({ start, end });
};

export const getDateFromWeekString = (weekString) => {
  const match = weekString.match(/KW \d+ \((\d{2}\.\d{2}) - \d{2}\.\d{2}\.(\d{4})\)/);
  if (!match) return null;
  
  const [startDay, startMonth] = match[1].split('.').map(Number);
  const year = parseInt(match[2]);
  
  return new Date(year, startMonth - 1, startDay);
}; 