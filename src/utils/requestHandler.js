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

export const validateRequest = (request, scheduleData, shiftTypes) => {
  // Grundlegende Validierungen
  if (!request.startDate || !request.endDate || !request.type || !request.employeeId) {
    return {
      isValid: false,
      message: 'Bitte füllen Sie alle erforderlichen Felder aus.'
    };
  }

  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Validiere Datumslogik
  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
    return {
      isValid: false,
      message: 'Bitte geben Sie gültige Daten ein.'
    };
  }

  if (startDate > endDate) {
    return {
      isValid: false,
      message: 'Das Startdatum muss vor dem Enddatum liegen.'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) {
    return {
      isValid: false,
      message: 'Das Startdatum darf nicht in der Vergangenheit liegen.'
    };
  }

  // Überprüfe maximale Urlaubsdauer
  const maxDays = 30;
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays > maxDays) {
    return {
      isValid: false,
      message: `Die maximale Dauer für einen Antrag beträgt ${maxDays} Tage.`
    };
  }

  // Überprüfe Schichtüberschneidungen
  if (scheduleData) {
    for (const weekKey in scheduleData) {
      const weekData = scheduleData[weekKey];
      for (const dayKey in weekData) {
        const dayData = weekData[dayKey];
        const currentDate = getDayDateFromWeekAndDay(weekKey, dayKey);
        
        if (!currentDate) continue;
        
        // Setze die Uhrzeit auf 0:00 für den Vergleich
        currentDate.setHours(0, 0, 0, 0);
        
        // Prüfe nur Tage im beantragten Zeitraum
        if (currentDate >= startDate && currentDate <= endDate) {
          // Prüfe alle Zeitslots des Tages
          for (const timeSlot in dayData) {
            const shifts = dayData[timeSlot];
            for (const shift of shifts) {
              // Prüfe nur reguläre Schichten (nicht-custom)
              if (!shift.isCustom) {
                const shiftEmployeeId = parseInt(shift.employeeId);
                const requestEmployeeId = parseInt(request.employeeId);
                
                if (shiftEmployeeId === requestEmployeeId) {
                  return {
                    isValid: false,
                    message: `Sie sind am ${formatDate(currentDate)} bereits für eine Schicht eingeplant. Ein Urlaubsantrag ist für diesen Tag nicht möglich.`
                  };
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    isValid: true,
    message: ''
  };
};

// Hilfsfunktion zum Formatieren des Datums
const formatDate = (date) => {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Hilfsfunktion zum Extrahieren des Datums aus Woche und Tag
const getDayDateFromWeekAndDay = (weekKey, dayKey) => {
  // Extrahiere das Startdatum aus dem Wochenschlüssel (Format: "KW XX (DD.MM - DD.MM.YYYY)")
  const match = weekKey.match(/(\d{2})\.(\d{2})\s*-\s*\d{2}\.\d{2}\.(\d{4})/);
  if (!match) return null;

  const [, startDay, startMonth, year] = match;
  const weekStart = new Date(year, parseInt(startMonth) - 1, parseInt(startDay));
  
  // Bestimme den Tag der Woche (0 = Montag, 6 = Sonntag)
  const dayIndex = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].indexOf(dayKey);
  
  if (dayIndex === -1) return null;
  
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayIndex);
  return date;
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