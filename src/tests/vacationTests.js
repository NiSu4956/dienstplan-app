import { format, addDays, setHours } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  validateRequest, 
  createShiftFromRequest,
  getDayDateFromWeekAndDay 
} from '../utils/requestHandler';
import { 
  standardizeDayIndex,
  getDayNameFromJS,
  isWeekend 
} from '../utils/dayUtils';
import { DATE_FORMATS, DAYS_OF_WEEK } from '../constants/dateFormats';

// Test-Mitarbeiter
const TEST_EMPLOYEE = {
  id: 999,
  name: "Test Mitarbeiter",
  role: "Vollzeit",
  workingHours: 40
};

// Test-Daten Generator
export const generateTestVacationData = () => {
  const today = new Date();
  const testCases = [
    // 1. Alle Wochentage in einer Woche
    {
      name: 'Komplette Woche',
      startDate: today,
      endDate: addDays(today, 6),
      description: 'Test über alle Wochentage'
    },
    // 2. Monatswechsel
    {
      name: 'Monatswechsel',
      startDate: new Date(today.getFullYear(), today.getMonth() + 1, -2), // Letzten 2 Tage des Monats
      endDate: new Date(today.getFullYear(), today.getMonth() + 1, 2),    // Ersten 2 Tage des nächsten Monats
      description: 'Test über Monatswechsel'
    },
    // 3. Jahreswechsel
    {
      name: 'Jahreswechsel',
      startDate: new Date(today.getFullYear(), 11, 30),  // 30. Dezember
      endDate: new Date(today.getFullYear() + 1, 0, 2),  // 2. Januar
      description: 'Test über Jahreswechsel'
    },
    // 4. Nur Wochenende
    {
      name: 'Nur Wochenende',
      startDate: getNextWeekend(),
      endDate: addDays(getNextWeekend(), 1),
      description: 'Test nur für Samstag und Sonntag'
    }
  ];

  return testCases.map(testCase => ({
    ...testCase,
    request: createTestRequest(testCase.startDate, testCase.endDate)
  }));
};

// Hilfsfunktionen
const getNextWeekend = () => {
  const today = new Date();
  const daysUntilSaturday = 6 - today.getDay();
  return addDays(today, daysUntilSaturday);
};

const createTestRequest = (startDate, endDate) => ({
  id: Date.now(),
  type: 'vacation',
  employeeId: TEST_EMPLOYEE.id,
  employeeName: TEST_EMPLOYEE.name,
  startDate: format(startDate, DATE_FORMATS.DE_SHORT),
  endDate: format(endDate, DATE_FORMATS.DE_SHORT),
  notes: 'Automatisch generierter Test-Urlaub'
});

// Manuelle Test-Funktion
export const runManualVacationTests = () => {
  console.log('URLAUB_TEST: Starte manuelle Tests...');
  
  const testCases = generateTestVacationData();
  
  testCases.forEach(testCase => {
    console.log(`\nURLAUB_TEST: Teste Szenario "${testCase.name}"`);
    console.log('Beschreibung:', testCase.description);
    
    // 1. Request-Erstellung testen
    console.log('\nTest Request:', {
      von: testCase.request.startDate,
      bis: testCase.request.endDate,
      mitarbeiter: testCase.request.employeeName
    });

    // 2. Shifts generieren
    const shifts = createShiftFromRequest(testCase.request);
    console.log('\nGenerierte Urlaubs-Einträge:', {
      anzahlTage: shifts.length,
      tage: shifts.map(shift => ({
        datum: shift.day,
        istWochenende: isWeekend(new Date(shift.id.split('-')[1]))
      }))
    });

    // 3. Wochentage überprüfen
    const uniqueDays = [...new Set(shifts.map(s => s.day))];
    console.log('\nAbgedeckte Wochentage:', {
      tage: uniqueDays,
      vollständig: uniqueDays.length === 7
    });

    // 4. Datumsformate überprüfen
    const dateFormats = shifts.map(shift => ({
      iso: shift.id.split('-')[1],
      tag: shift.day,
      startZeit: shift.customStartTime,
      endZeit: shift.customEndTime
    }));
    console.log('\nVerwendete Datumsformate:', dateFormats);
  });
};

// Unit Tests
export const vacationTestSuite = {
  testSingleDayRequest: () => {
    const today = new Date();
    const request = createTestRequest(today, today);
    const shifts = createShiftFromRequest(request);
    
    return {
      name: 'Einzeltag-Urlaub',
      passed: shifts.length === 1 &&
             shifts[0].day === getDayNameFromJS(today) &&
             shifts[0].customStartTime === '00:00' &&
             shifts[0].customEndTime === '23:59',
      details: { shifts }
    };
  },

  testWeekendRequest: () => {
    const saturday = getNextWeekend();
    const sunday = addDays(saturday, 1);
    const request = createTestRequest(saturday, sunday);
    const shifts = createShiftFromRequest(request);
    
    return {
      name: 'Wochenend-Urlaub',
      passed: shifts.length === 2 &&
             shifts.every(shift => isWeekend(new Date(shift.id.split('-')[1]))),
      details: { shifts }
    };
  },

  testDateFormatConsistency: () => {
    const today = new Date();
    const request = createTestRequest(today, today);
    const shift = createShiftFromRequest(request)[0];
    
    const dateInISO = shift.id.split('-')[1];
    const dateObj = new Date(dateInISO);
    
    return {
      name: 'Datumsformat-Konsistenz',
      passed: shift.day === getDayNameFromJS(dateObj) &&
             format(dateObj, DATE_FORMATS.DE_SHORT) === request.startDate,
      details: { shift, dateInISO, originalDate: request.startDate }
    };
  },

  testMonthTransition: () => {
    const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const firstDayOfNextMonth = addDays(lastDayOfMonth, 1);
    const request = createTestRequest(lastDayOfMonth, firstDayOfNextMonth);
    const shifts = createShiftFromRequest(request);
    
    return {
      name: 'Monatswechsel',
      passed: shifts.length === 2 &&
             shifts[0].day === getDayNameFromJS(lastDayOfMonth) &&
             shifts[1].day === getDayNameFromJS(firstDayOfNextMonth),
      details: { shifts }
    };
  }
};

// Funktion zum Ausführen aller Unit Tests
export const runVacationUnitTests = () => {
  console.log('URLAUB_TEST: Starte Unit Tests...\n');
  
  const results = Object.entries(vacationTestSuite).map(([testName, testFn]) => {
    const result = testFn();
    console.log(`Test: ${result.name}`);
    console.log(`Status: ${result.passed ? 'BESTANDEN ✅' : 'FEHLGESCHLAGEN ❌'}`);
    if (!result.passed) {
      console.log('Details:', result.details);
    }
    console.log('-------------------');
    return { name: testName, ...result };
  });

  const summary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length
  };

  console.log('\nTest-Zusammenfassung:', summary);
  return summary;
}; 