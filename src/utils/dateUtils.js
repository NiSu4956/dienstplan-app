import { format, parse } from 'date-fns';
import { de } from 'date-fns/locale';

export const DATE_FORMATS = {
  DE_SHORT: 'dd.MM.yyyy',
  DE_LONG: 'EEEE, dd. MMMM yyyy',
  DE_TIME: 'HH:mm',
  ISO: 'yyyy-MM-dd',
  WEEK: "'KW' ww '('dd.MM - dd.MM.yyyy')'",
  WEEKDAY_DATE: 'EEEE, dd.MM.yyyy',
  TIME_24: 'HH:mm'
};

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