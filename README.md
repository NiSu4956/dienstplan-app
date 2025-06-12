# Dienstplan-App

Eine moderne Webanwendung zur Verwaltung von Dienstplänen, Mitarbeitern und Urlaubsanträgen.

## Features

- 📅 Dienstplanverwaltung
- 👥 Mitarbeiterverwaltung
- 🏖️ Urlaubsanträge
- 📊 Dashboard mit Übersichten
- 🔐 Benutzerauthentifizierung
- 📱 Responsive Design

## Technologien

- React 18
- Tailwind CSS
- Jest & React Testing Library
- Context API für State Management
- LocalStorage für Datenpersistenz

## Installation

1. Repository klonen:
```bash
git clone [repository-url]
cd dienstplan-app
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
npm start
```

Die App ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Projektstruktur

```
src/
├── components/     # React Komponenten
├── contexts/      # Context Provider
├── hooks/         # Custom Hooks
├── utils/         # Hilfsfunktionen
├── styles/        # CSS Styles
├── tests/         # Test Dateien
└── config/        # Konfigurationsdateien
```

## Entwicklung

### Tests ausführen
```bash
npm test
```

### Build erstellen
```bash
npm run build
```

## Komponenten

### EmployeeView
Verwaltet die Mitarbeiterliste mit folgenden Funktionen:
- Mitarbeiter hinzufügen/bearbeiten/löschen
- Suche nach Mitarbeitern
- Filterung nach Qualifikationen

### RequestList
Zeigt Urlaubsanträge an mit:
- Status-Anzeige (Genehmigt/Ausstehend/Abgelehnt)
- Detailansicht
- Admin-Kommentare

### Dashboard
Bietet Übersichten für:
- Aktuelle Dienstpläne
- Ausstehende Anträge
- Mitarbeiterstatistiken

## State Management

Die App verwendet die Context API für das State Management:
- `AppContext`: Globaler State für Mitarbeiter, Anträge und Einstellungen
- `useEmployeeManagement`: Custom Hook für Mitarbeiterverwaltung

## Styling

- Tailwind CSS für das Layout
- Custom CSS für spezifische Komponenten
- Responsive Design für mobile Geräte

## Tests

Die App verwendet Jest und React Testing Library für Tests:
- Unit Tests für Utility-Funktionen
- Integration Tests für Komponenten
- Snapshot Tests für UI-Komponenten

## Deployment

1. Build erstellen:
```bash
npm run build
```

2. Build-Ordner auf dem Server deployen

## Lizenz

MIT
