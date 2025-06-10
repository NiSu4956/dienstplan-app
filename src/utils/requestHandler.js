import { parse } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  DATE_FORMATS, 
  formatDate, 
  getDatesInRange,
  getWeekString,
  normalizeDate,
  getWeekKey,
  normalizeDateForComparison
} from './dateUtils';
import { 
  jsToArrayIndex,
  getDayNameFromJS,
  isWorkday 
} from './dayUtils';
import { DAYS_OF_WEEK } from '../constants/dateFormats';
import { REQUEST_TYPES, CUSTOM_SHIFTS } from '../constants/requestFormTexts';
import { validateDateRange, validateRequiredFields, validateShiftConflicts, validateExistingRequests } from './requestValidators';

/**
 * Erstellt einen benutzerdefinierten Schichteintrag für einen Urlaubs- oder Krankheitsantrag
 */
const createCustomShift = (request, date, weekNumber) => ({
  id: `${request.id}-${formatDate(date, DATE_FORMATS.ISO)}`,
  type: request.type === REQUEST_TYPES.VACATION ? REQUEST_TYPES.VACATION : REQUEST_TYPES.SICK,
  customTitle: request.type === REQUEST_TYPES.VACATION ? CUSTOM_SHIFTS.VACATION.title : CUSTOM_SHIFTS.SICK.title,
  customStartTime: request.type === REQUEST_TYPES.VACATION ? CUSTOM_SHIFTS.VACATION.startTime : CUSTOM_SHIFTS.SICK.startTime,
  customEndTime: request.type === REQUEST_TYPES.VACATION ? CUSTOM_SHIFTS.VACATION.endTime : CUSTOM_SHIFTS.SICK.endTime,
  customColor: request.type === REQUEST_TYPES.VACATION ? CUSTOM_SHIFTS.VACATION.color : CUSTOM_SHIFTS.SICK.color,
  isCustom: true,
  customEmployeeIds: [request.employeeId],
  name: request.employeeName,
  notes: request.notes,
  week: weekNumber,
  day: DAYS_OF_WEEK[jsToArrayIndex(date.getDay())]
});

/**
 * Erstellt Schichteinträge für einen Zeitraum basierend auf einem Antrag
 */
export const createShiftFromRequest = (request) => {
  const startDate = parse(request.startDate, DATE_FORMATS.DE_SHORT, new Date());
  const endDate = parse(request.endDate, DATE_FORMATS.DE_SHORT, new Date());
  
  return getDatesInRange(startDate, endDate).map(date => {
    const weekNumber = formatDate(date, DATE_FORMATS.WEEK);
    return createCustomShift(request, date, weekNumber);
  });
};

/**
 * Validiert einen Antrag und prüft auf Konflikte
 */
export const validateRequest = (request, scheduleData, existingRequests) => {
  // Prüfe erforderliche Felder
  const requiredFieldsValidation = validateRequiredFields(request);
  if (!requiredFieldsValidation.isValid) {
    return requiredFieldsValidation;
  }

  // Bereite Datumswerte vor
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Prüfe Datumsbereich
  const dateValidation = validateDateRange(startDate, endDate);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  // Prüfe auf bereits genehmigte Urlaubsanträge
  if (request.type === REQUEST_TYPES.VACATION) {
    const existingRequestsValidation = validateExistingRequests(request, existingRequests);
    if (!existingRequestsValidation.isValid) {
      return existingRequestsValidation;
    }
  }

  // Prüfe Schichtkonflikte nur für Urlaubsanträge
  if (request.type === REQUEST_TYPES.VACATION && scheduleData) {
    const conflictValidation = validateShiftConflicts(request, scheduleData, startDate, endDate);
    if (!conflictValidation.isValid) {
      return conflictValidation;
    }
  }

  return { isValid: true };
};

/**
 * Prüft, ob ein Datum innerhalb eines Antragszeitraums liegt
 */
export const isDateInRequest = (date, request) => {
  const normalizedDate = normalizeDateForComparison(date);
  const normalizedStart = normalizeDateForComparison(request.startDate);
  const normalizedEnd = normalizeDateForComparison(request.endDate);
  
  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
};

/**
 * Filtert Anträge für eine bestimmte Woche
 */
export const getRequestsForWeek = (requests, weekString) => {
  if (!requests || !weekString) {
    return [];
  }
  
  return requests.filter(request => {
    const requestWeek = getWeekKey(new Date(request.startDate));
    return requestWeek === weekString;
  });
}; 