import React, { useMemo } from 'react';
import { REQUEST_TYPES } from '../constants';

function Dashboard({ scheduleData, employees, requests, currentUser }) {
  // KPIs berechnen
  const kpis = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Krankenquote berechnen
    const sickLeaveRequests = requests.filter(req => 
      req.type === REQUEST_TYPES.SICK && 
      req.status === 'approved' &&
      new Date(req.startDate).getMonth() === currentMonth
    );
    
    const totalEmployees = employees.length;
    const sickLeaveRate = (sickLeaveRequests.length / totalEmployees) * 100;

    // Urlaubsübersicht
    const vacationRequests = requests.filter(req => 
      req.type === REQUEST_TYPES.VACATION && 
      req.status === 'approved' &&
      new Date(req.startDate).getFullYear() === currentYear
    );

    const pendingRequests = requests.filter(req => req.status === 'pending');

    // Schichtabdeckung
    const totalShifts = Object.values(scheduleData).reduce((acc, week) => {
      return acc + Object.values(week).reduce((dayAcc, day) => {
        return dayAcc + Object.values(day).reduce((slotAcc, slot) => {
          return slotAcc + slot.length;
        }, 0);
      }, 0);
    }, 0);

    return {
      sickLeaveRate,
      vacationCount: vacationRequests.length,
      pendingRequestsCount: pendingRequests.length,
      totalShifts,
      averageShiftsPerEmployee: totalShifts / totalEmployees
    };
  }, [scheduleData, employees, requests]);

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>
      
      {/* KPI-Karten */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Krankenquote</h3>
          <div className="kpi-value">{kpis.sickLeaveRate.toFixed(1)}%</div>
          <div className="kpi-label">im aktuellen Monat</div>
        </div>

        <div className="kpi-card">
          <h3>Genehmigte Urlaubstage</h3>
          <div className="kpi-value">{kpis.vacationCount}</div>
          <div className="kpi-label">in diesem Jahr</div>
        </div>

        <div className="kpi-card">
          <h3>Offene Anträge</h3>
          <div className="kpi-value">{kpis.pendingRequestsCount}</div>
          <div className="kpi-label">müssen bearbeitet werden</div>
        </div>

        <div className="kpi-card">
          <h3>Ø Schichten</h3>
          <div className="kpi-value">{kpis.averageShiftsPerEmployee.toFixed(1)}</div>
          <div className="kpi-label">pro Mitarbeiter</div>
        </div>
      </div>

      {/* Aktuelle Abwesenheiten */}
      <div className="dashboard-section">
        <h3>Aktuelle Abwesenheiten</h3>
        <div className="absence-list">
          {requests
            .filter(req => 
              req.status === 'approved' && 
              new Date(req.startDate) <= new Date() && 
              new Date(req.endDate) >= new Date()
            )
            .map(absence => (
              <div key={absence.id} className={`absence-card ${absence.type}`}>
                <div className="absence-header">
                  <span className="employee-name">{absence.employeeName}</span>
                  <span className={`absence-type ${absence.type}`}>
                    {absence.type === REQUEST_TYPES.VACATION ? 'Urlaub' : 'Krank'}
                  </span>
                </div>
                <div className="absence-dates">
                  {new Date(absence.startDate).toLocaleDateString()} - {new Date(absence.endDate).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Qualifikationsmatrix */}
      <div className="dashboard-section">
        <h3>Qualifikationsübersicht</h3>
        <div className="qualification-matrix">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Mitarbeiter</th>
                {Array.from(new Set(employees.flatMap(emp => emp.qualifications))).map(qual => (
                  <th key={qual}>{qual}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  {Array.from(new Set(employees.flatMap(emp => emp.qualifications))).map(qual => (
                    <td key={qual} className="matrix-cell">
                      {employee.qualifications.includes(qual) ? '✓' : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schnellzugriff */}
      <div className="dashboard-section">
        <h3>Schnellzugriff</h3>
        <div className="quick-actions">
          <button className="action-button">
            <span className="action-icon">📝</span>
            Dienstplan erstellen
          </button>
          <button className="action-button">
            <span className="action-icon">📅</span>
            Urlaub beantragen
          </button>
          <button className="action-button">
            <span className="action-icon">👥</span>
            Mitarbeiter verwalten
          </button>
          <button className="action-button">
            <span className="action-icon">📊</span>
            Berichte exportieren
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 