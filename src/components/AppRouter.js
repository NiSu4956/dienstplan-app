import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import WeekView from './WeekView';
import EmployeePortal from './EmployeePortal';
import AdminArea from './AdminArea';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import { validateRequest, handleRequestApproval } from '../utils/requestHandler';

function Navigation({ currentUser, onLogout }) {
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
          {currentUser?.role === 'admin' && (
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
              {currentUser.role !== 'admin' && (
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
}

function AppRouter() {
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    'KW 21 (19.05 - 25.05.2025)': {
      'Montag': {
        '7:00': [{ 
          id: 1, 
          employeeId: 1, 
          name: 'Sabine', 
          task: 'Frühdienst', 
          type: 'blue',
          shiftTypeId: 1,
          notes: ''
        }]
      }
    }
  });
  
  // Mitarbeiter-Daten
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Sabine', role: 'Vollzeit', qualifications: ['WG1', 'WG2', 'Nachtdienst'] },
    { id: 2, name: 'Manu', role: 'Vollzeit', qualifications: ['WG1', 'Kochen'] },
    { id: 3, name: 'Levin', role: 'Teilzeit', qualifications: ['Schule', 'Freizeitaktivitäten'] },
    { id: 4, name: 'CK', role: 'Vollzeit', qualifications: ['WG2', 'Nachtdienst'] },
    { id: 5, name: 'Nelli', role: 'Teilzeit', qualifications: ['Kochen', 'WG1'] },
    { id: 6, name: 'PD', role: 'admin', qualifications: ['Management', 'Notfall'] },
    { id: 7, name: 'Eva', role: 'Teilzeit', qualifications: ['WG1', 'Nachmittagsprogramm'] },
    { id: 8, name: 'Fabi', role: 'Vollzeit', qualifications: ['WG2', 'Nachtdienst'] },
    { id: 9, name: 'Daniel', role: 'Teilzeit', qualifications: ['Nachmittagsprogramm'] },
    { id: 10, name: 'Admin', role: 'admin', qualifications: ['Administration'] }
  ]);

  // Schichttypen-Daten
  const [shiftTypes, setShiftTypes] = useState([
    { id: 1, name: 'Frühdienst', startTime: '07:00', endTime: '14:00', color: 'blue' },
    { id: 2, name: 'Tagesdienst', startTime: '09:00', endTime: '17:00', color: 'green' },
    { id: 3, name: 'Spätdienst', startTime: '14:00', endTime: '21:00', color: 'purple' },
    { id: 4, name: 'Nachtdienst', startTime: '21:00', endTime: '07:00', color: 'gray' },
    { id: 5, name: 'Kochen', startTime: '11:00', endTime: '14:00', color: 'red' },
    { id: 6, name: 'Wochenende', startTime: '09:00', endTime: '21:00', color: 'yellow' }
  ]);
  
  // Login-Handler
  const handleLogin = (employee) => {
    setCurrentUser(employee);
    // Optional: Speichere den Login-Status im localStorage
    localStorage.setItem('currentUser', JSON.stringify(employee));
  };

  // Logout-Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Prüfe beim Start, ob ein Benutzer im localStorage gespeichert ist
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSubmitRequest = (newRequest) => {
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
  };

  const handleApproveRequest = (request) => {
    // Aktualisiere den Request-Status
    setRequests(prev => prev.map(r => 
      r.id === request.id ? { 
        ...r, 
        status: 'approved',
        adminComment: request.adminComment 
      } : r
    ));

    // Erstelle einen neuen Schichteintrag für den genehmigten Antrag
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    const employee = employees.find(e => e.name === request.employeeName);

    if (!employee) return;

    // Für jeden Tag im Zeitraum einen Eintrag erstellen
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const weekKey = getWeekKey(currentDate);
      const dayName = getDayName(currentDate);
      
      // Erstelle den Schichteintrag
      const newShift = {
        id: Date.now() + Math.random(), // Eindeutige ID
        isCustom: true,
        customTitle: request.type === 'vacation' ? 'Urlaub' : 'Krank',
        customStartTime: '00:00',
        customEndTime: '23:59',
        customColor: request.type === 'vacation' ? 'vacation' : 'sick',
        customEmployeeIds: [employee.id],
        notes: request.adminComment || request.notes || '',
        name: employee.name,
        type: request.type === 'vacation' ? 'vacation' : 'sick'
      };

      // Füge den Eintrag zum Schedule hinzu
      setScheduleData(prev => {
        const newData = { ...prev };
        if (!newData[weekKey]) newData[weekKey] = {};
        if (!newData[weekKey][dayName]) newData[weekKey][dayName] = {};
        if (!newData[weekKey][dayName]['07:00']) newData[weekKey][dayName]['07:00'] = [];
        
        // Prüfe, ob bereits ein Eintrag für diesen Tag existiert
        const existingEntryIndex = newData[weekKey][dayName]['07:00']
          .findIndex(entry => entry.customEmployeeIds?.includes(employee.id));
        
        if (existingEntryIndex >= 0) {
          // Aktualisiere den bestehenden Eintrag
          newData[weekKey][dayName]['07:00'][existingEntryIndex] = newShift;
        } else {
          // Füge einen neuen Eintrag hinzu
          newData[weekKey][dayName]['07:00'].push(newShift);
        }
        
        return newData;
      });

      // Gehe zum nächsten Tag
      currentDate.setDate(currentDate.getDate() + 1);
    }
  };

  const handleRejectRequest = (request) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id ? { 
        ...r, 
        status: 'rejected',
        adminComment: request.adminComment 
      } : r
    ));
  };

  // Hilfsfunktion: Ermittelt den Wochenschlüssel für ein Datum
  const getWeekKey = (date) => {
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay() + 1); // Montag
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Sonntag

    const formatDate = (d) => {
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${day}.${month}`;
    };

    return `KW ${weekNumber} (${formatDate(startDate)} - ${formatDate(endDate)}.${year})`;
  };

  // Hilfsfunktion: Ermittelt die Kalenderwoche
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  // Hilfsfunktion: Ermittelt den deutschen Wochentag
  const getDayName = (date) => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[date.getDay()];
  };

  return (
    <Router>
      <div className="app-container">
        <Navigation currentUser={currentUser} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route path="/login" element={
              currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} employees={employees} />
            } />
            
            <Route path="/" element={
              currentUser ? (
                currentUser.role === 'admin' ? (
                  <WeekView 
                    employees={employees}
                    shiftTypes={shiftTypes}
                    scheduleData={scheduleData}
                    setScheduleData={setScheduleData}
                    isEditable={true}
                  />
                ) : (
                  <WeekView 
                    employees={employees}
                    shiftTypes={shiftTypes}
                    scheduleData={scheduleData}
                    setScheduleData={setScheduleData}
                    isEditable={false}
                  />
                )
              ) : (
                <WeekView 
                  employees={employees}
                  shiftTypes={shiftTypes}
                  scheduleData={scheduleData}
                  setScheduleData={setScheduleData}
                  isEditable={false}
                />
              )
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
              <ProtectedRoute user={currentUser} requiredRole="admin">
                <AdminArea 
                  employees={employees}
                  setEmployees={setEmployees}
                  shiftTypes={shiftTypes}
                  setShiftTypes={setShiftTypes}
                  requests={requests}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default AppRouter; 