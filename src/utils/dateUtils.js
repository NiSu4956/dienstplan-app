import { format, parse, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { DATE_FORMATS } from '../constants/dateFormats';

export { DATE_FORMATS };

export const formatDate = (date, formatStr = DATE_FORMATS.DE_SHORT) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: de });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, `${DATE_FORMATS.DE_SHORT} ${DATE_FORMATS.DE_TIME}`, { locale: de });
};

export const parseDate = (dateString, formatStr = DATE_FORMATS.DE_SHORT) => {
  return parse(dateString, formatStr, new Date(), { locale: de });
};

export const formatWeekString = (date) => {
  return formatDate(date, DATE_FORMATS.WEEK);
};

export const formatTime = (date) => {
  return formatDate(date, DATE_FORMATS.TIME_24);
};

export const getCurrentWeekString = () => {
  return formatWeekString(new Date());
};

export const isCurrentDay = (dateString) => {
  const today = new Date();
  const date = parseDate(dateString);
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