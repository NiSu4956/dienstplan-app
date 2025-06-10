import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import WeekView from './WeekView';
import EmployeePortal from './EmployeePortal';
import AdminArea from './AdminArea';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import { validateRequest } from '../utils/requestHandler';
import { STORAGE_KEYS, ROLES, REQUEST_TYPES, DEFAULT_TIME_SLOT, DAYS_OF_WEEK } from '../constants';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import Settings from './settings/Settings';
import { jsToArrayIndex, jsToISODay, getMonday, getDayNameFromJS } from '../utils/dayUtils';
import { getWeekKey, formatDate, parseAnyDate } from '../utils/dateUtils';

// Memoized initial data
const INITIAL_SCHEDULE_DATA = {};

const INITIAL_EMPLOYEES = [
  { id: 1, name: 'Sabine', role: 'Vollzeit', qualifications: ['WG1', 'WG2', 'Nachtdienst'], workingHours: 40 },
  { id: 2, name: 'Manu', role: 'Vollzeit', qualifications: ['WG1', 'Kochen'], workingHours: 40 },
  { id: 3, name: 'Levin', role: 'Teilzeit', qualifications: ['Schule', 'Freizeitaktivitäten'], workingHours: 20 },
  { id: 7, name: 'Eva', role: 'Teilzeit', qualifications: ['WG1', 'Nachmittagsprogramm'], workingHours: 25 },
  { id: 8, name: 'Fabi', role: 'Vollzeit', qualifications: ['WG2', 'Nachtdienst'], workingHours: 40 },
  { id: 10, name: 'Admin', role: ROLES.ADMIN, qualifications: ['Administration'], workingHours: 40, password: 'Admin' }
];

const INITIAL_CHILDREN = [
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

const INITIAL_SHIFT_TYPES = [
  { id: 1, name: 'Frühdienst', startTime: '07:00', endTime: '14:00', color: 'blue' },
  { id: 2, name: 'Tagesdienst', startTime: '09:00', endTime: '17:00', color: 'green' },
  { id: 3, name: 'Spätdienst', startTime: '14:00', endTime: '21:00', color: 'purple' },
  { id: 4, name: 'Nachtdienst', startTime: '21:00', endTime: '07:00', color: 'gray' },
  { id: 5, name: 'Kochen', startTime: '11:00', endTime: '14:00', color: 'red' },
  { id: 6, name: 'Wochenende', startTime: '09:00', endTime: '21:00', color: 'yellow' }
];

// Memoized Navigation component
const NavigationComponent = memo(({ currentUser, onLogout }) => {
  const location = useLocation();
  
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          Dienstplan-App
        </div>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dienstplan
            </Link>
          </li>
          {currentUser?.role === ROLES.ADMIN && (
            <li>
              <Link 
                to="/admin" 
                className={location.pathname === '/admin' ? 'active' : ''}
              >
                Admin-Bereich
              </Link>
            </li>
          )}
          {currentUser ? (
            <>
              {currentUser.role !== ROLES.ADMIN && (
                <li>
                  <Link 
                    to="/portal" 
                    className={location.pathname === '/portal' ? 'active' : ''}
                  >
                    Mitarbeiterportal
                  </Link>
                </li>
              )}
              <li>
                <button onClick={onLogout} className="nav-button">
                  Abmelden ({currentUser.name})
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link 
                to="/login" 
                className={location.pathname === '/login' ? 'active' : ''}
              >
                Anmelden
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
});

// Cache for date calculations
const dateCache = new Map();

function AppRouter() {
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [scheduleData, setScheduleData] = useState(() => {
    // Während der Entwicklung immer mit leeren Daten starten
    return INITIAL_SCHEDULE_DATA;
  });
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [shiftTypes, setShiftTypes] = useState(INITIAL_SHIFT_TYPES);
  const [children, setChildren] = useState(() => {
    const savedChildren = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    return savedChildren ? JSON.parse(savedChildren) : INITIAL_CHILDREN;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    // Speichere Änderungen weiterhin im localStorage während der Laufzeit
    localStorage.setItem(STORAGE_KEYS.SCHEDULE_DATA, JSON.stringify(scheduleData));
  }, [scheduleData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
  }, [children]);

  const handleLogin = useCallback((employee) => {
    setCurrentUser(employee);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(employee));
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const updateRequestStatus = useCallback((request, status) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id ? { 
        ...r, 
        status,
        adminComment: request.adminComment 
      } : r
    ));
  }, []);

  const createCustomShift = useCallback((request, employee) => ({
    id: Date.now() + Math.random(),
    isCustom: true,
    customTitle: request.type === REQUEST_TYPES.VACATION ? 'Urlaub' : 'Krank',
    customStartTime: '00:00',
    customEndTime: '23:59',
    customColor: request.type === REQUEST_TYPES.VACATION ? 'vacation' : 'sick',
    customEmployeeIds: [employee.id],
    notes: request.adminComment || request.notes || '',
    name: employee.name,
    type: request.type === REQUEST_TYPES.VACATION ? REQUEST_TYPES.VACATION : REQUEST_TYPES.SICK
  }), []);

  const handleSubmitRequest = useCallback((newRequest) => {
    const validation = validateRequest(newRequest, scheduleData);
    
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
    
    setRequests(prev => [...prev, { 
      ...newRequest, 
      id: Date.now(),
      status: 'pending',
      timestamp: new Date().toISOString(),
      employeeName: currentUser.name
    }]);
  }, [currentUser, scheduleData]);

  const getDayName = useCallback((date) => {
    return getDayNameFromJS(date.getDay());
  }, []);

  const getWeekNumber = useCallback((date) => {
    const dateString = date.toISOString();
    const cacheKey = `week_${dateString}`;
    
    if (dateCache.has(cacheKey)) {
      return dateCache.get(cacheKey);
    }

    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const isoDay = jsToISODay(d.getUTCDay());
    d.setUTCDate(d.getUTCDate() + 4 - isoDay);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const result = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    dateCache.set(cacheKey, result);
    return result;
  }, []);

  const getWeekKey = useCallback((date) => {
    const dateString = date.toISOString();
    if (dateCache.has(dateString)) {
      return dateCache.get(dateString);
    }

    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    const startDate = getMonday(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const formatDate = (d) => {
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${day}.${month}`;
    };

    const key = `KW ${weekNumber} (${formatDate(startDate)} - ${formatDate(endDate)}.${year})`;
    dateCache.set(dateString, key);
    return key;
  }, [getWeekNumber]);

  const handleApproveRequest = useCallback((request) => {
    console.log('URLAUB_DEBUG [handleApproveRequest] Start:', {
      antrag: request,
      mitarbeiter: request.employeeName
    });

    updateRequestStatus(request, 'approved');

    try {
      const startDate = parseAnyDate(request.startDate);
      const endDate = parseAnyDate(request.endDate);
      
      if (!startDate || !endDate) {
        console.error('URLAUB_DEBUG [handleApproveRequest] Ungültige Daten:', {
          startDate: request.startDate,
          endDate: request.endDate
        });
        return;
      }
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const employee = employees.find(e => e.name === request.employeeName);

      if (!employee) {
        console.error('URLAUB_DEBUG [handleApproveRequest] Mitarbeiter nicht gefunden:', {
          name: request.employeeName
        });
        return;
      }

      console.log('URLAUB_DEBUG [handleApproveRequest] Zeitraum:', {
        von: formatDate(startDate),
        bis: formatDate(endDate),
        vonTag: getDayNameFromJS(startDate.getDay()),
        bisTag: getDayNameFromJS(endDate.getDay())
      });

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const weekKey = getWeekKey(currentDate);
        const dayName = getDayNameFromJS(currentDate.getDay());
        const newShift = createCustomShift(request, employee, currentDate);

        console.log('URLAUB_DEBUG [handleApproveRequest] Erstelle Eintrag:', {
          datum: formatDate(currentDate),
          wochentag: dayName,
          woche: weekKey,
          schicht: newShift
        });

        setScheduleData(prev => {
          const newData = { ...prev };
          if (!newData[weekKey]) newData[weekKey] = {};
          if (!newData[weekKey][dayName]) newData[weekKey][dayName] = {};
          if (!newData[weekKey][dayName][DEFAULT_TIME_SLOT]) newData[weekKey][dayName][DEFAULT_TIME_SLOT] = [];
          
          const existingEntryIndex = newData[weekKey][dayName][DEFAULT_TIME_SLOT]
            .findIndex(entry => entry.customEmployeeIds?.includes(employee.id));
          
          if (existingEntryIndex >= 0) {
            console.log('URLAUB_DEBUG [handleApproveRequest] Überschreibe existierenden Eintrag:', {
              datum: formatDate(currentDate),
              wochentag: dayName,
              alterEintrag: newData[weekKey][dayName][DEFAULT_TIME_SLOT][existingEntryIndex]
            });
            newData[weekKey][dayName][DEFAULT_TIME_SLOT][existingEntryIndex] = newShift;
          } else {
            newData[weekKey][dayName][DEFAULT_TIME_SLOT].push(newShift);
          }
          
          return newData;
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('URLAUB_DEBUG [handleApproveRequest] Antrag erfolgreich genehmigt');
    } catch (error) {
      console.error('URLAUB_DEBUG [handleApproveRequest] Fehler:', error);
    }
  }, [employees, createCustomShift, updateRequestStatus, getWeekKey, getDayName]);

  const handleRejectRequest = useCallback((request) => {
    updateRequestStatus(request, 'rejected');
  }, [updateRequestStatus]);

  const renderWeekView = useCallback((isEditable = false) => (
    <WeekView 
      employees={employees}
      shiftTypes={shiftTypes}
      scheduleData={scheduleData}
      setScheduleData={setScheduleData}
      isEditable={isEditable}
      currentUser={currentUser}
      children={children}
    />
  ), [employees, shiftTypes, scheduleData, currentUser, children]);

  return (
    <Router>
      <div className="app-container">
        <NavigationComponent currentUser={currentUser} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route path="/login" element={
              currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} employees={employees} />
            } />
            
            <Route path="/" element={
              currentUser ? (
                currentUser.role === ROLES.ADMIN ? renderWeekView(true) : renderWeekView(false)
              ) : renderWeekView(false)
            } />
            
            <Route path="/portal" element={
              <ProtectedRoute user={currentUser}>
                <EmployeePortal 
                  currentUser={currentUser}
                  requests={requests}
                  onSubmitRequest={handleSubmitRequest}
                />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute user={currentUser} requiredRole={ROLES.ADMIN}>
                <AdminArea 
                  employees={employees}
                  setEmployees={setEmployees}
                  shiftTypes={shiftTypes}
                  setShiftTypes={setShiftTypes}
                  requests={requests}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                  scheduleData={scheduleData}
                  children={children}
                  setChildren={setChildren}
                />
              </ProtectedRoute>
            } />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard 
                    scheduleData={scheduleData}
                    employees={employees}
                    requests={requests}
                    currentUser={currentUser}
                  />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default AppRouter; 