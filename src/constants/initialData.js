import { ROLES } from './roles';

export const INITIAL_SCHEDULE_DATA = {};

export const INITIAL_EMPLOYEES = [
  { id: 1, name: 'Sabine', role: 'Vollzeit', qualifications: ['WG1', 'WG2', 'Nachtdienst'], workingHours: 40 },
  { id: 2, name: 'Manu', role: 'Vollzeit', qualifications: ['WG1', 'Kochen'], workingHours: 40 },
  { id: 3, name: 'Levin', role: 'Teilzeit', qualifications: ['Schule', 'Freizeitaktivitäten'], workingHours: 20 },
  { id: 7, name: 'Eva', role: 'Teilzeit', qualifications: ['WG1', 'Nachmittagsprogramm'], workingHours: 25 },
  { id: 8, name: 'Fabi', role: 'Vollzeit', qualifications: ['WG2', 'Nachtdienst'], workingHours: 40 },
  { id: 10, name: 'Admin', role: ROLES.ADMIN, qualifications: ['Administration'], workingHours: 40, password: 'Admin' }
];

export const INITIAL_CHILDREN = [
  { 
    id: 1, 
    name: 'Max Mustermann', 
    group: 'WG1',
    birthDate: '2018-05-15',
    notes: 'Allergisch gegen Erdnüsse',
    documentation: []
  },
  { 
    id: 2, 
    name: 'Lisa Schmidt', 
    group: 'WG2',
    birthDate: '2019-03-22',
    notes: 'Nimmt regelmäßig Medikamente',
    documentation: []
  }
];

export const INITIAL_SHIFT_TYPES = [
  { id: 1, name: 'Frühdienst', startTime: '07:00', endTime: '14:00', color: 'blue' },
  { id: 2, name: 'Tagesdienst', startTime: '09:00', endTime: '17:00', color: 'green' },
  { id: 3, name: 'Spätdienst', startTime: '14:00', endTime: '21:00', color: 'purple' },
  { id: 4, name: 'Nachtdienst', startTime: '21:00', endTime: '07:00', color: 'gray' },
  { id: 5, name: 'Kochen', startTime: '11:00', endTime: '14:00', color: 'red' },
  { id: 6, name: 'Wochenende', startTime: '09:00', endTime: '21:00', color: 'yellow' }
]; 