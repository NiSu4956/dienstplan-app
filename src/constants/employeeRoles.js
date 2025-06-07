export const EMPLOYEE_ROLES = {
  FULL_TIME: {
    id: 'FULL_TIME',
    name: 'Vollzeit',
    weeklyHours: 40,
    description: 'Vollzeitbeschäftigte Mitarbeiter (40 Stunden/Woche)',
    color: '#4CAF50'
  },
  PART_TIME_30: {
    id: 'PART_TIME_30',
    name: 'Teilzeit 30h',
    weeklyHours: 30,
    description: 'Teilzeitbeschäftigte Mitarbeiter (30 Stunden/Woche)',
    color: '#2196F3'
  },
  PART_TIME_20: {
    id: 'PART_TIME_20',
    name: 'Teilzeit 20h',
    weeklyHours: 20,
    description: 'Teilzeitbeschäftigte Mitarbeiter (20 Stunden/Woche)',
    color: '#9C27B0'
  },
  MINI_JOB: {
    id: 'MINI_JOB',
    name: 'Minijob',
    weeklyHours: 10,
    description: 'Geringfügig beschäftigte Mitarbeiter (max. 10 Stunden/Woche)',
    color: '#FF9800'
  },
  TRAINEE: {
    id: 'TRAINEE',
    name: 'Auszubildende',
    weeklyHours: 40,
    description: 'Auszubildende Mitarbeiter (40 Stunden/Woche)',
    color: '#795548'
  },
  INTERN: {
    id: 'INTERN',
    name: 'Praktikant',
    weeklyHours: 40,
    description: 'Praktikanten (40 Stunden/Woche)',
    color: '#607D8B'
  }
};

export const getEmployeeRole = (roleId) => {
  return EMPLOYEE_ROLES[roleId] || null;
};

export const getWeeklyHours = (roleId) => {
  const role = getEmployeeRole(roleId);
  return role ? role.weeklyHours : 0;
};

export const calculateMonthlyTargetHours = (roleId, year, month) => {
  const weeklyHours = getWeeklyHours(roleId);
  if (!weeklyHours) return 0;

  // Berechne die Anzahl der Arbeitstage im Monat (Mo-Fr)
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  let workingDays = 0;

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    // 0 = Sonntag, 6 = Samstag
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      workingDays++;
    }
  }

  // Berechne die Zielstunden für den Monat
  // (Wochenstunden / 5 Arbeitstage) * Anzahl der Arbeitstage im Monat
  return (weeklyHours / 5) * workingDays;
}; 