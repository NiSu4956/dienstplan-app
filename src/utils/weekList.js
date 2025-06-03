// Generiere eine Liste von Kalenderwochen für die nächsten Jahre
export const generateWeekList = (startYear = 2025, numberOfYears = 4) => {
  const weeks = [];
  
  for (let year = startYear; year < startYear + numberOfYears; year++) {
    const firstDay = new Date(year, 0, 1);
    const dayOfWeek = firstDay.getDay();
    const daysToAdd = dayOfWeek <= 1 ? 1 - dayOfWeek : 8 - dayOfWeek;
    firstDay.setDate(firstDay.getDate() + daysToAdd);

    let currentDate = new Date(firstDay);
    let weekNumber = 1;

    while (currentDate.getFullYear() === year || weekNumber === 1) {
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + 6);

      const weekString = `KW ${String(weekNumber).padStart(2, '0')} (${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')} - ${endDate.getDate().toString().padStart(2, '0')}.${(endDate.getMonth() + 1).toString().padStart(2, '0')}.${endDate.getFullYear()})`;
      weeks.push(weekString);

      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }
  }

  return weeks;
};

// Hilfsfunktionen für die Navigation
export const getNextWeek = (currentWeek, weekList) => {
  const currentIndex = weekList.indexOf(currentWeek);
  if (currentIndex < weekList.length - 1) {
    return weekList[currentIndex + 1];
  }
  return currentWeek;
};

export const getPreviousWeek = (currentWeek, weekList) => {
  const currentIndex = weekList.indexOf(currentWeek);
  if (currentIndex > 0) {
    return weekList[currentIndex - 1];
  }
  return currentWeek;
};

// Hilfsfunktion zum Extrahieren des Jahres aus einer Kalenderwoche
export const getYearFromWeek = (weekString) => {
  const match = weekString.match(/\d{4}$/);
  return match ? parseInt(match[0]) : null;
};

// Hilfsfunktion zum Finden der aktuellen Kalenderwoche
export const getCurrentWeek = (weekList) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  const currentWeek = weekList.find(week => {
    const match = week.match(/\((\d{2}\.\d{2})\s*-\s*\d{2}\.\d{2}\.(\d{4})\)/);
    if (!match) return false;

    const [startDay, startMonth] = match[1].split('.').map(Number);
    const year = parseInt(match[2]);
    
    if (year !== currentYear) return false;
    
    const weekStart = new Date(year, startMonth - 1, startDay);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return today >= weekStart && today <= weekEnd;
  });
  
  return currentWeek || weekList[0];
}; 