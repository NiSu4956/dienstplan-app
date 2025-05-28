import { parse, eachDayOfInterval, format, isWithinInterval, parseISO, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

export const createShiftFromRequest = (request, shiftTypes) => {
  const startDate = parse(request.startDate, 'dd.MM.yyyy', new Date());
  const endDate = parse(request.endDate, 'dd.MM.yyyy', new Date());
  
  // Erstelle für jeden Tag im Zeitraum einen Eintrag
  const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  const shifts = daysInRange.map(date => {
    const formattedDate = format(date, 'EEEE', { locale: de });
    const weekNumber = format(date, "'KW' ww '('dd.MM - dd.MM.yyyy')'");
    
    return {
      id: `${request.id}-${format(date, 'yyyy-MM-dd')}`,
      type: request.type === 'vacation' ? 'vacation' : 'sickness',
      customTitle: request.type === 'vacation' ? '🏖️ Urlaub' : '🏥 Krank',
      customStartTime: '00:00',
      customEndTime: '23:59',
      customColor: request.type === 'vacation' ? 'blue' : 'red',
      isCustom: true,
      customEmployeeIds: [request.employeeId],
      name: request.employeeName,
      notes: request.note,
      week: weekNumber,
      day: formattedDate
    };
  });

  return shifts;
};

export const handleRequestApproval = (request, scheduleData) => {
  // Implementierung der Genehmigungslogik
  // Diese Funktion könnte die Schichtpläne aktualisieren
  return {
    success: true,
    message: 'Antrag erfolgreich genehmigt'
  };
};

// Hilfsfunktion zum Parsen des Datums
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Versuche das Datum im ISO-Format zu parsen (YYYY-MM-DD)
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  // Versuche das Datum im deutschen Format zu parsen (DD.MM.YYYY)
  const [day, month, year] = dateString.split('.').map(num => parseInt(num, 10));
  if (day && month && year) {
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
};

export const validateRequest = (request, scheduleData) => {
  // Überprüfe, ob alle erforderlichen Felder vorhanden sind
  if (!request.startDate || !request.endDate || !request.type) {
    return {
      isValid: false,
      message: 'Bitte füllen Sie alle erforderlichen Felder aus.'
    };
  }

  // Parse die Daten
  const startDate = parseDate(request.startDate);
  const endDate = parseDate(request.endDate);

  // Überprüfe, ob die Daten gültig sind
  if (!startDate || !endDate) {
    return {
      isValid: false,
      message: 'Bitte geben Sie gültige Daten ein.'
    };
  }

  // Überprüfe, ob das Startdatum vor dem Enddatum liegt
  if (startDate > endDate) {
    return {
      isValid: false,
      message: 'Das Startdatum muss vor dem Enddatum liegen.'
    };
  }

  // Überprüfe, ob das Startdatum in der Vergangenheit liegt
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) {
    return {
      isValid: false,
      message: 'Das Startdatum darf nicht in der Vergangenheit liegen.'
    };
  }

  // Überprüfe die maximale Urlaubsdauer (z.B. 30 Tage)
  const maxDays = 30;
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays > maxDays) {
    return {
      isValid: false,
      message: `Die maximale Dauer für einen Antrag beträgt ${maxDays} Tage.`
    };
  }

  // Überprüfe auf Überschneidungen mit bestehenden Anträgen
  const requestDays = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    requestDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Hier könnte man noch prüfen, ob es Überschneidungen mit bestehenden Schichten gibt
  // Dies würde eine Iteration über scheduleData erfordern

  return {
    isValid: true,
    message: ''
  };
};

// Hilfsfunktionen
const getWeekIdentifier = (date) => {
  // Implementiere die Logik zur Bestimmung der Kalenderwoche
  // Format: 'KW XX (DD.MM.YYYY - DD.MM.YYYY)'
  // Diese Funktion muss an Ihre spezifische Implementierung angepasst werden
  return 'KW 21 (19.05 - 25.05.2025)'; // Beispiel
};

const getDayName = (date) => {
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  return days[date.getDay()];
}; 