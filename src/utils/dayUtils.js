/**
 * Utility functions for standardized day handling
 * 
 * Standards used:
 * - JavaScript: Sunday=0 to Saturday=6
 * - Our Standard: Monday=0 to Sunday=6 (used in DAYS_OF_WEEK array)
 */

import { DAYS_OF_WEEK } from '../constants/dateFormats';

// Konstanten für Wochentage (0-6 System)
export const WEEKDAYS = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6
};

// JavaScript's getDay() Konstanten zur Referenz
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
 * Konvertiert JavaScript's getDay() (0=Sonntag) zu unserem Index (0=Montag)
 */
export const jsToArrayIndex = (jsDay) => {
  return jsDay === 0 ? 6 : jsDay - 1;
};

/**
 * Konvertiert unseren Index (0=Montag) zu JavaScript's getDay() (0=Sonntag)
 */
export const arrayIndexToJSDay = (arrayIndex) => {
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
  const arrayIndex = jsToArrayIndex(date.getDay());
  return arrayIndex === WEEKDAYS.SATURDAY || arrayIndex === WEEKDAYS.SUNDAY;
};

/**
 * Gibt das Datum des Montags der aktuellen Woche zurück
 */
export const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Gibt das Datum des Sonntags der aktuellen Woche zurück
 */
export const getSunday = (date) => {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
};

/**
 * Prüft ob ein Tag ein Arbeitstag ist (Montag-Freitag)
 */
export const isWorkday = (date) => {
  const arrayIndex = jsToArrayIndex(date.getDay());
  return arrayIndex >= WEEKDAYS.MONDAY && arrayIndex <= WEEKDAYS.FRIDAY;
};

/**
 * Konvertiert JavaScript's getDay() (0=Sonntag) zu ISO Wochentag (1=Montag bis 7=Sonntag)
 */
export const jsToISODay = (jsDay) => {
  return jsDay === 0 ? 7 : jsDay;
};