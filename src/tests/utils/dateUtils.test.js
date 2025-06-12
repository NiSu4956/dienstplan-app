import {
  normalizeDateForComparison,
  formatDate,
  formatDateTime,
  parseAnyDate,
  getWeekKey,
  isCurrentDay,
  calculateTimeDifference,
  formatTimeRange,
  getDatesInRange,
  getDateFromWeekString
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  describe('normalizeDateForComparison', () => {
    it('sollte ein Date-Objekt normalisieren', () => {
      const date = new Date('2024-03-15T14:30:00');
      const normalized = normalizeDateForComparison(date);
      expect(normalized.getHours()).toBe(0);
      expect(normalized.getMinutes()).toBe(0);
      expect(normalized.getSeconds()).toBe(0);
      expect(normalized.getMilliseconds()).toBe(0);
    });

    it('sollte einen String in ein Date-Objekt umwandeln', () => {
      const dateStr = '15.03.2024';
      const normalized = normalizeDateForComparison(dateStr);
      expect(normalized).toBeInstanceOf(Date);
      expect(normalized.getDate()).toBe(15);
      expect(normalized.getMonth()).toBe(2); // März ist 2
      expect(normalized.getFullYear()).toBe(2024);
    });

    it('sollte null für ungültige Eingaben zurückgeben', () => {
      expect(normalizeDateForComparison(null)).toBeNull();
      expect(normalizeDateForComparison('invalid')).toBeNull();
      expect(normalizeDateForComparison(undefined)).toBeNull();
    });
  });

  describe('formatDate', () => {
    it('sollte ein Datum im deutschen Format formatieren', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toBe('15.03.2024');
    });

    it('sollte einen leeren String für ungültige Eingaben zurückgeben', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('invalid')).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('calculateTimeDifference', () => {
    it('sollte die Zeitdifferenz in Minuten berechnen', () => {
      expect(calculateTimeDifference('09:00', '17:00')).toBe(480);
      expect(calculateTimeDifference('23:00', '01:00')).toBe(120); // Über Mitternacht
    });

    it('sollte 0 für gleiche Zeiten zurückgeben', () => {
      expect(calculateTimeDifference('09:00', '09:00')).toBe(0);
    });
  });

  describe('formatTimeRange', () => {
    it('sollte einen Zeitbereich formatieren', () => {
      expect(formatTimeRange('09:00', '17:00')).toBe('09:00 - 17:00');
    });
  });

  describe('getDatesInRange', () => {
    it('sollte alle Tage zwischen zwei Daten zurückgeben', () => {
      const start = new Date('2024-03-15');
      const end = new Date('2024-03-17');
      const dates = getDatesInRange(start, end);
      
      expect(dates).toHaveLength(3);
      expect(dates[0].getDate()).toBe(15);
      expect(dates[1].getDate()).toBe(16);
      expect(dates[2].getDate()).toBe(17);
    });

    it('sollte ein leeres Array für ungültige Eingaben zurückgeben', () => {
      expect(getDatesInRange('invalid', '2024-03-17')).toEqual([]);
      expect(getDatesInRange('2024-03-15', 'invalid')).toEqual([]);
    });
  });

  describe('getDateFromWeekString', () => {
    it('sollte ein Datum aus einem Wochenschlüssel extrahieren', () => {
      const weekString = 'KW 11 (11.03 - 17.03.2024)';
      const date = getDateFromWeekString(weekString);
      
      expect(date).toBeInstanceOf(Date);
      expect(date.getDate()).toBe(11);
      expect(date.getMonth()).toBe(2); // März ist 2
      expect(date.getFullYear()).toBe(2024);
    });

    it('sollte null für ungültige Wochenschlüssel zurückgeben', () => {
      expect(getDateFromWeekString('invalid')).toBeNull();
      expect(getDateFromWeekString('KW 11')).toBeNull();
    });
  });
}); 