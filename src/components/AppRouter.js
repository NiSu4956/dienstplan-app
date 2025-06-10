import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import WeekView from './WeekView';
import EmployeePortal from './EmployeePortal';
import AdminArea from './AdminArea';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import { validateRequest } from '../utils/requestHandler';
import { STORAGE_KEYS, REQUEST_TYPES, DEFAULT_TIME_SLOT } from '../constants';
import Dashboard from './Dashboard';
import Settings from './settings/Settings';
import { getMonday, getDayNameFromJS } from '../utils/dayUtils';
import { formatDate, parseAnyDate } from '../utils/dateUtils';
import MainNavigation from './navigation/MainNavigation';
import { 
  INITIAL_SCHEDULE_DATA, 
  INITIAL_EMPLOYEES, 
  INITIAL_CHILDREN, 
  INITIAL_SHIFT_TYPES 
} from '../constants/initialData';

// Cache for date calculations
const dateCache = new Map();

/**
 * Hauptrouter der Anwendung
 * Verwaltet das Routing und den globalen Zustand
 */
function AppRouter() {
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [scheduleData, setScheduleData] = useState(() => {
    return INITIAL_SCHEDULE_DATA;
  });
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [shiftTypes, setShiftTypes] = useState(INITIAL_SHIFT_TYPES);
  const [children, setChildren] = useState(() => {
    const savedChildren = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    return savedChildren ? JSON.parse(savedChildren) : INITIAL_CHILDREN;
  });

  // Lade gespeicherten Benutzer beim Start
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Speichere Änderungen im localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE_DATA, JSON.stringify(scheduleData));
  }, [scheduleData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
  }, [children]);

  /**
   * Behandelt den Login-Prozess
   * @param {Object} employee - Mitarbeiter-Daten
   */
  const handleLogin = useCallback((employee) => {
    setCurrentUser(employee);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(employee));
  }, []);

  /**
   * Behandelt den Logout-Prozess
   */
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  /**
   * Aktualisiert den Status eines Requests
   * @param {Object} request - Der zu aktualisierende Request
   * @param {string} status - Der neue Status
   */
  const updateRequestStatus = useCallback((request, status) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id ? { 
        ...r, 
        status,
        adminComment: request.adminComment 
      } : r
    ));
  }, []);

  /**
   * Erstellt einen benutzerdefinierten Shift für einen Request
   * @param {Object} request - Der Request
   * @param {Object} employee - Der Mitarbeiter
   * @returns {Object} Der erstellte Shift
   */
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

  /**
   * Behandelt das Einreichen eines neuen Requests
   * @param {Object} newRequest - Der neue Request
   */
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

  /**
   * Behandelt die Genehmigung eines Requests
   * @param {Object} request - Der zu genehmigende Request
   */
  const handleApproveRequest = useCallback((request) => {
    updateRequestStatus(request, 'approved');

    try {
      const startDate = parseAnyDate(request.startDate);
      const endDate = parseAnyDate(request.endDate);
      
      if (!startDate || !endDate) {
        return;
      }
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const employee = employees.find(e => e.name === request.employeeName);

      if (!employee) {
        return;
      }

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const weekKey = getWeekKey(currentDate);
        const dayName = getDayNameFromJS(currentDate.getDay());
        const newShift = createCustomShift(request, employee);

        setScheduleData(prev => {
          const newData = { ...prev };
          if (!newData[weekKey]) newData[weekKey] = {};
          if (!newData[weekKey][dayName]) newData[weekKey][dayName] = {};
          if (!newData[weekKey][dayName][DEFAULT_TIME_SLOT]) newData[weekKey][dayName][DEFAULT_TIME_SLOT] = [];
          
          const existingEntryIndex = newData[weekKey][dayName][DEFAULT_TIME_SLOT]
            .findIndex(entry => entry.customEmployeeIds?.includes(employee.id));
          
          if (existingEntryIndex >= 0) {
            newData[weekKey][dayName][DEFAULT_TIME_SLOT][existingEntryIndex] = newShift;
          } else {
            newData[weekKey][dayName][DEFAULT_TIME_SLOT].push(newShift);
          }
          
          return newData;
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    } catch (error) {
      console.error('Fehler beim Genehmigen des Requests:', error);
    }
  }, [employees, createCustomShift, updateRequestStatus]);

  /**
   * Behandelt die Ablehnung eines Requests
   * @param {Object} request - Der abzulehnende Request
   */
  const handleRejectRequest = useCallback((request) => {
    updateRequestStatus(request, 'rejected');
  }, [updateRequestStatus]);

  /**
   * Generiert einen Wochenschlüssel
   * @param {Date} date - Das Datum
   * @returns {string} Der Wochenschlüssel
   */
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
  }, []);

  /**
   * Berechnet die Kalenderwoche
   * @param {Date} date - Das Datum
   * @returns {number} Die Kalenderwoche
   */
  const getWeekNumber = useCallback((date) => {
    const dateString = date.toISOString();
    const cacheKey = `week_${dateString}`;
    
    if (dateCache.has(cacheKey)) {
      return dateCache.get(cacheKey);
    }

    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const isoDay = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
    d.setUTCDate(d.getUTCDate() + 4 - isoDay);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const result = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    dateCache.set(cacheKey, result);
    return result;
  }, []);

  return (
    <Router>
      <MainNavigation 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={currentUser}>
              <WeekView 
                scheduleData={scheduleData}
                setScheduleData={setScheduleData}
                employees={employees}
                shiftTypes={shiftTypes}
                children={children}
                setChildren={setChildren}
                isEditable={currentUser?.role === 'admin'}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute user={currentUser} requiredRole="admin">
              <AdminArea 
                requests={requests}
                updateRequestStatus={updateRequestStatus}
                createCustomShift={createCustomShift}
                scheduleData={scheduleData}
                setScheduleData={setScheduleData}
                employees={employees}
                setEmployees={setEmployees}
                shiftTypes={shiftTypes}
                setShiftTypes={setShiftTypes}
                children={children}
                setChildren={setChildren}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/portal" 
          element={
            <ProtectedRoute user={currentUser}>
              <EmployeePortal 
                currentUser={currentUser}
                requests={requests}
                onSubmitRequest={handleSubmitRequest}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} employees={employees} />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={currentUser}>
              <Dashboard 
                scheduleData={scheduleData}
                employees={employees}
                children={children}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute user={currentUser}>
              <Settings 
                employees={employees}
                setEmployees={setEmployees}
                shiftTypes={shiftTypes}
                setShiftTypes={setShiftTypes}
                children={children}
                setChildren={setChildren}
              />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default AppRouter; 