import { REQUEST_CONFIG } from '../config/requestConfig';
import { REQUEST_FORM_TEXTS } from '../constants/requestFormTexts';
import { formatDate, getDatesInRange, getWeekKey, normalizeDateForComparison } from './dateUtils';
import { getDayNameFromJS } from './dayUtils';
import { REQUEST_TYPES } from '../constants/requestFormTexts';

/**
 * Hilfsfunktion zum Erstellen einer Validierungsantwort
 */
const createValidationResponse = (isValid, message = '') => ({
  isValid,
  message
});

/**
 * Normalisiert ein Datum für den Vergleich
 */
const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalizeDateForComparison(normalized);
};

/**
 * Berechnet die Anzahl der Tage zwischen zwei Daten (inklusive)
 */
const calculateDaysBetween = (startDate, endDate) => {
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Validiert den Datumsbereich eines Antrags
 */
export const validateDateRange = (startDate, endDate) => {
  // Prüfe auf gültige Datumswerte
  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
    return createValidationResponse(false, REQUEST_FORM_TEXTS.error.validation.invalidDate);
  }

  // Prüfe auf logische Datumsreihenfolge
  if (startDate > endDate) {
    return createValidationResponse(false, REQUEST_FORM_TEXTS.error.validation.invalidDateRange);
  }

  // Prüfe auf Datum in der Vergangenheit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) {
    return createValidationResponse(false, REQUEST_FORM_TEXTS.error.validation.pastDate);
  }

  // Prüfe auf maximale Dauer
  const diffDays = calculateDaysBetween(startDate, endDate);
  if (diffDays > REQUEST_CONFIG.MAX_REQUEST_DAYS) {
    return createValidationResponse(
      false,
      REQUEST_FORM_TEXTS.error.validation.maxDuration.replace('{days}', REQUEST_CONFIG.MAX_REQUEST_DAYS)
    );
  }

  return createValidationResponse(true);
};

/**
 * Validiert die erforderlichen Felder eines Antrags
 */
export const validateRequiredFields = (request) => {
  const requiredFields = ['startDate', 'endDate', 'type', 'employeeId'];
  const missingFields = requiredFields.filter(field => !request[field]);

  if (missingFields.length > 0) {
    return createValidationResponse(false, REQUEST_FORM_TEXTS.error.validation.requiredFields);
  }

  return createValidationResponse(true);
};

/**
 * Prüft auf Überschneidungen mit bestehenden Anträgen
 */
const hasDateOverlap = (requestStart, requestEnd, existingStart, existingEnd) => {
  return (
    (requestStart >= existingStart && requestStart <= existingEnd) || // Neuer Antrag beginnt während bestehendem Antrag
    (requestEnd >= existingStart && requestEnd <= existingEnd) || // Neuer Antrag endet während bestehendem Antrag
    (requestStart <= existingStart && requestEnd >= existingEnd) // Neuer Antrag umschließt bestehenden Antrag
  );
};

/**
 * Validiert Überschneidungen mit bestehenden Anträgen
 */
export const validateExistingRequests = (request, existingRequests) => {
  if (!existingRequests?.length) {
    return createValidationResponse(true);
  }

  const requestStart = normalizeDate(request.startDate);
  const requestEnd = normalizeDate(request.endDate);
  
  for (const existingRequest of existingRequests) {
    if (existingRequest.status === 'approved' && existingRequest.type === REQUEST_TYPES.VACATION) {
      const existingStart = normalizeDate(existingRequest.startDate);
      const existingEnd = normalizeDate(existingRequest.endDate);

      if (hasDateOverlap(requestStart, requestEnd, existingStart, existingEnd)) {
        return createValidationResponse(
          false,
          REQUEST_FORM_TEXTS.error.validation.existingVacation
            .replace('{date}', `${formatDate(existingStart)} - ${formatDate(existingEnd)}`)
        );
      }
    }
  }

  return createValidationResponse(true);
};

/**
 * Prüft auf Konflikte mit geplanten Schichten
 */
const checkDayConflicts = (dayData, employeeId) => {
  const requestEmployeeId = parseInt(employeeId);
  
  return Object.values(dayData).some(shifts => 
    shifts.some(shift => 
      !shift.isCustom && parseInt(shift.employeeId) === requestEmployeeId
    )
  );
};

/**
 * Validiert Konflikte mit geplanten Schichten
 */
export const validateShiftConflicts = (request, scheduleData, startDate, endDate) => {
  if (!scheduleData) {
    return createValidationResponse(true);
  }

  const dates = getDatesInRange(startDate, endDate);
  
  for (const date of dates) {
    const weekKey = getWeekKey(date);
    const dayKey = getDayNameFromJS(date.getDay());
    const dayData = scheduleData[weekKey]?.[dayKey];
    
    if (dayData && checkDayConflicts(dayData, request.employeeId)) {
      return createValidationResponse(
        false,
        REQUEST_FORM_TEXTS.error.validation.shiftConflict.replace('{date}', formatDate(date))
      );
    }
  }
  
  return createValidationResponse(true);
}; 