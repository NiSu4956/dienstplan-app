/**
 * Utility functions for standardized day handling
 * 
 * Standards used:
 * - JavaScript: Sunday=0 to Saturday=6
 * - ISO-8601: Monday=1 to Sunday=7
 * - Array Index: Monday=0 to Sunday=6 (used in DAYS_OF_WEEK array)
 */

import { DAYS_OF_WEEK } from '../constants/dateFormats';

// Konstanten für Wochentage
export const WEEKDAYS = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
};

export const JS_DAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

/**
 * Konvertiert JavaScript's getDay() (0=Sonntag) zu ISO Wochentag (1=Montag)
 */
export const jsToISODay = (jsDay) => {
  return jsDay === 0 ? 7 : jsDay;
};

/**
 * Konvertiert ISO Wochentag (1=Montag) zu JavaScript's getDay() (0=Sonntag)
 */
export const isoToJSDay = (isoDay) => {
  return isoDay === 7 ? 0 : isoDay;
};

/**
 * Konvertiert JavaScript's getDay() (0=Sonntag) zu Array-Index (0=Montag)
 */
export const jsToArrayIndex = (jsDay) => {
  return jsDay === 0 ? 6 : jsDay - 1;
};

/**
 * Konvertiert Array-Index (0=Montag) zu JavaScript's getDay() (0=Sonntag)
 */
export const arrayIndexToJS = (arrayIndex) => {
  return arrayIndex === 6 ? 0 : arrayIndex + 1;
};

/**
 * Gibt den deutschen Wochentagnamen für einen JavaScript Wochentag zurück
 */
export const getDayNameFromJS = (jsDay) => {
  const arrayIndex = jsToArrayIndex(jsDay);
  return DAYS_OF_WEEK[arrayIndex];
};

/**
 * Gibt den Array-Index (0=Montag) für einen deutschen Wochentagnamen zurück
 */
export const getDayIndexFromName = (dayName) => {
  return DAYS_OF_WEEK.indexOf(dayName);
};

/**
 * Prüft ob ein Datum ein Wochenende ist
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === JS_DAYS.SATURDAY || day === JS_DAYS.SUNDAY;
};

/**
 * Gibt das Datum des Montags der aktuellen Woche zurück
 */
export const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
};

/**
 * Gibt das Datum des Sonntags der aktuellen Woche zurück
 */
export const getSunday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  d.setDate(diff);
  return d;
};

/**
 * Prüft ob ein Tag ein Arbeitstag ist (Mo-Sa)
 */
export const isWorkday = (date) => {
  return date.getDay() !== JS_DAYS.SUNDAY;
};

/**
 * Konvertiert ein Datum zu einem Wochentag-String
 */
export const getWeekdayString = (date) => {
  return getDayNameFromJS(date.getDay());
}; 