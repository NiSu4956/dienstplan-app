export const REQUEST_TYPES = {
  VACATION: 'vacation',
  SICK: 'sickness'
};

export const CUSTOM_SHIFTS = {
  VACATION: {
    title: '🏖️ Urlaub',
    color: 'blue',
    startTime: '00:00',
    endTime: '23:59'
  },
  SICK: {
    title: '🏥 Krank',
    color: 'red',
    startTime: '00:00',
    endTime: '23:59'
  }
};

export const REQUEST_FORM_TEXTS = {
  labels: {
    startDate: 'Startdatum:',
    endDate: 'Enddatum:',
    notes: 'Anmerkungen:'
  },
  placeholders: {
    vacation: 'Zusätzliche Informationen zum Urlaub...',
    sickness: 'Grund der Krankmeldung...'
  },
  buttons: {
    cancel: 'Abbrechen',
    submit: {
      vacation: 'Urlaub beantragen',
      sickness: 'Krankmeldung einreichen'
    }
  },
  error: {
    title: 'Fehler',
    validation: {
      invalidDateRange: 'Das Enddatum muss nach dem Startdatum liegen.',
      invalidDate: 'Bitte wählen Sie ein gültiges Datum.',
      invalidShift: 'Der gewählte Zeitraum überschneidet sich mit geplanten Schichten.',
      invalidRequest: 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.',
      pastDate: 'Das Startdatum darf nicht in der Vergangenheit liegen.',
      maxDuration: 'Die maximale Dauer für einen Antrag beträgt {days} Tage.',
      requiredFields: 'Bitte füllen Sie alle erforderlichen Felder aus.',
      shiftConflict: 'Sie sind am {date} bereits für eine Schicht eingeplant. Ein Urlaubsantrag ist für diesen Tag nicht möglich.',
      existingVacation: 'Sie haben bereits einen genehmigten Urlaubsantrag für den {date}. Bitte wählen Sie einen anderen Zeitraum.'
    }
  }
};

export const DATE_PICKER_CONFIG = {
  dateFormat: 'dd.MM.yyyy',
  locale: 'de',
  className: 'form-control'
}; 