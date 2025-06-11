import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { jsPDF } from 'jspdf';
import { 
  formatDate, 
  calculateTimeDifference, 
  formatTimeRange,
  DATE_FORMATS 
} from '../../utils/dateUtils';
import { MONTHS } from '../../constants/dateFormats';
import { isWeekend, getDayIndexFromName } from '../../utils/dayUtils';

function WorkingHoursOverview({ employee, scheduleData, shiftTypes, onClose }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyHours, setMonthlyHours] = useState(0);
  const [detailedShifts, setDetailedShifts] = useState([]);
  const [weeklyHours, setWeeklyHours] = useState([]);
  const [showWeeklyOverview, setShowWeeklyOverview] = useState(false);
  const [showDetailedList, setShowDetailedList] = useState(false);

  useEffect(() => {
    calculateMonthlyHours();
  }, [selectedMonth, selectedYear, employee, scheduleData]);

  const calculateMonthlyHours = () => {
    let totalMinutes = 0;
    const shiftsArray = [];
    const weeklyHoursArray = [];
    let currentWeekHours = 0;
    let currentWeekNumber = -1;

    const targetWeeklyHours = employee.workingHours || (employee.role === 'Vollzeit' ? 40 : 0);

    Object.entries(scheduleData).forEach(([week, weekData]) => {
      const weekMatch = week.match(/KW (\d+)/);
      const weekNumber = weekMatch ? parseInt(weekMatch[1]) : -1;
      
      if (weekNumber !== currentWeekNumber && currentWeekNumber !== -1) {
        weeklyHoursArray.push({
          weekNumber: currentWeekNumber,
          hours: currentWeekHours,
          overtime: calculateOvertime(currentWeekHours, targetWeeklyHours)
        });
        currentWeekHours = 0;
      }
      currentWeekNumber = weekNumber;

      Object.entries(weekData).forEach(([day, dayData]) => {
        const dayIndex = getDayIndexFromName(day);
        if (dayIndex === -1) return;

        const weekStartDate = parseWeekString(week);
        if (!weekStartDate) return;

        const currentDate = new Date(weekStartDate);
        currentDate.setDate(weekStartDate.getDate() + dayIndex);

        Object.entries(dayData).forEach(([timeSlot, shifts]) => {
          shifts.forEach(shift => {
            if (isEmployeeShift(shift, employee.id)) {
              const shiftDuration = calculateShiftDuration(shift, shiftTypes);
              
              if (currentDate.getMonth() === selectedMonth && currentDate.getFullYear() === selectedYear) {
                totalMinutes += shiftDuration;
                currentWeekHours += shiftDuration / 60;

                shiftsArray.push({
                  date: formatDate(currentDate),
                  timeSlot: getShiftTimeRange(shift, shiftTypes),
                  duration: shiftDuration,
                  type: getShiftType(shift, shiftTypes)
                });
              }
            }
          });
        });
      });
    });

    if (currentWeekNumber !== -1) {
      weeklyHoursArray.push({
        weekNumber: currentWeekNumber,
        hours: currentWeekHours,
        overtime: calculateOvertime(currentWeekHours, targetWeeklyHours)
      });
    }

    setMonthlyHours(totalMinutes / 60);

    const sortedShifts = shiftsArray.sort((a, b) => {
      const dateA = parseGermanDate(a.date);
      const dateB = parseGermanDate(b.date);
      return dateB - dateA;
    });

    setDetailedShifts(sortedShifts);
    setWeeklyHours(weeklyHoursArray);
  };

  const calculateOvertime = (actualHours, targetHours) => {
    return actualHours - targetHours;
  };

  const parseWeekString = (weekString) => {
    const dateMatch = weekString.match(/\((\d{2})\.(\d{2})\s*-\s*\d{2}\.\d{2}\.(\d{4})\)/);
    if (!dateMatch) return null;
    
    const [, day, month, year] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  };

  const isEmployeeShift = (shift, employeeId) => {
    if (!shift) return false;
    return shift.isCustom 
      ? shift.customEmployeeIds?.includes(parseInt(employeeId))
      : parseInt(shift.employeeId) === parseInt(employeeId);
  };

  const calculateShiftDuration = (shift, shiftTypes) => {
    if (shift.isCustom) {
      if (!shift.customStartTime || !shift.customEndTime) return 0;
      return calculateTimeDifference(shift.customStartTime, shift.customEndTime);
    }

    const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
    if (!shiftType || !shiftType.startTime || !shiftType.endTime) return 0;
    
    return calculateTimeDifference(shiftType.startTime, shiftType.endTime);
  };

  const getShiftTimeRange = (shift, shiftTypes) => {
    if (shift.isCustom) {
      return formatTimeRange(shift.customStartTime, shift.customEndTime);
    }

    const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
    return shiftType ? formatTimeRange(shiftType.startTime, shiftType.endTime) : '';
  };

  const getShiftType = (shift, shiftTypes) => {
    if (shift.isCustom) {
      if (shift.type === 'vacation') return 'Urlaub';
      if (shift.type === 'sick') return 'Krank';
      return shift.customTitle || 'Sonderschicht';
    }

    const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
    return shiftType ? shiftType.name : '';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const years = [2024, 2025, 2026, 2027, 2028];

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Titel
    doc.setFontSize(16);
    doc.text(`Stundenübersicht - ${employee.name}`, margin, margin);

    // Monat und Jahr
    doc.setFontSize(12);
    doc.text(`${months[selectedMonth]} ${selectedYear}`, margin, margin + 10);

    // Gesamtstunden
    doc.setFontSize(12);
    const targetHours = employee.workingHours || (employee.role === 'Vollzeit' ? 40 : 0);
    const totalOvertime = calculateOvertime(monthlyHours, targetHours * (weeklyHours.length));
    doc.text(`Gesamtstunden: ${monthlyHours.toFixed(2)} Stunden`, margin, margin + 20);
    doc.text(`Sollstunden: ${(targetHours * weeklyHours.length).toFixed(2)} Stunden`, margin, margin + 30);
    doc.text(`Überstunden: ${totalOvertime.toFixed(2)} Stunden`, margin, margin + 40);

    // Wöchentliche Übersicht
    doc.setFontSize(12);
    doc.text("Wöchentliche Übersicht:", margin, margin + 60);
    
    let yPos = margin + 70;
    weeklyHours.forEach((week, index) => {
      const text = `KW ${week.weekNumber}: ${week.hours.toFixed(2)} Stunden (${week.overtime > 0 ? '+' : ''}${week.overtime.toFixed(2)} Stunden)`;
      doc.text(text, margin, yPos);
      yPos += 10;
    });

    // Detaillierte Auflistung
    yPos += 10;
    doc.text("Detaillierte Auflistung:", margin, yPos);
    yPos += 10;

    detailedShifts.forEach(shift => {
      if (yPos > doc.internal.pageSize.height - margin) {
        doc.addPage();
        yPos = margin;
      }
      const text = `${shift.date}: ${shift.timeSlot} - ${shift.type} (${(shift.duration / 60).toFixed(2)} Stunden)`;
      doc.text(text, margin, yPos);
      yPos += 10;
    });

    doc.save(`Stundenübersicht_${employee.name}_${months[selectedMonth]}_${selectedYear}.pdf`);
  };

  const downloadAsCSV = () => {
    let csvContent = "Datum;Zeitraum;Schichttyp;Stunden\n";
    
    detailedShifts.forEach(shift => {
      csvContent += `${shift.date};${shift.timeSlot};${shift.type};${(shift.duration / 60).toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Stundenübersicht_${employee.name}_${months[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hilfsfunktion zum Parsen des deutschen Datums
  const parseGermanDate = (dateStr) => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Stundenübersicht - ${employee.name}`}
    >
      <div className="working-hours-overview">
        <div className="filter-section">
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="export-buttons">
            <button className="button" onClick={downloadAsPDF}>PDF</button>
            <button className="button" onClick={downloadAsCSV}>CSV</button>
          </div>
        </div>

        <div className="summary-section">
          <h3>Übersicht {months[selectedMonth]} {selectedYear}</h3>
          <div className="hours-summary">
            <div className="hours-item">
              <span className="hours-label">Ist-Stunden {months[selectedMonth]}:</span>
              <span className="hours-value">{monthlyHours.toFixed(2)} Stunden</span>
            </div>
            <div className="hours-item">
              <span className="hours-label">Sollstunden {months[selectedMonth]}:</span>
              <span className="hours-value">
                {(((employee.workingHours || (employee.role === 'Vollzeit' ? 40 : 0)) / 5) * getWorkingDaysInMonth(selectedYear, selectedMonth)).toFixed(2)} Stunden
              </span>
            </div>
            <div className="hours-item">
              <span className="hours-label">Überstunden:</span>
              <span className={`hours-value ${calculateOvertime(monthlyHours, ((employee.workingHours || (employee.role === 'Vollzeit' ? 40 : 0)) / 5) * getWorkingDaysInMonth(selectedYear, selectedMonth)) > 0 ? 'overtime-positive' : 'overtime-negative'}`}>
                {calculateOvertime(monthlyHours, ((employee.workingHours || (employee.role === 'Vollzeit' ? 40 : 0)) / 5) * getWorkingDaysInMonth(selectedYear, selectedMonth)).toFixed(2)} Stunden
              </span>
            </div>
          </div>
        </div>

        <div className="collapsible-sections">
          <div className="section weekly-overview">
            <button 
              className={`section-toggle ${showWeeklyOverview ? 'open' : ''}`}
              onClick={() => setShowWeeklyOverview(!showWeeklyOverview)}
            >
              <h4>Wöchentliche Übersicht</h4>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 6L8 10L12 6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {showWeeklyOverview && (
              <div className="section-content">
                <div className="weekly-hours-list">
                  {weeklyHours.map((week, index) => (
                    <div key={index} className="weekly-hours-item">
                      <span className="week-number">KW {week.weekNumber}</span>
                      <div className="week-hours-details">
                        <div className="hours-column">
                          <div className="hours-row">
                            <span className="hours-label">Ist:</span>
                            <span className="hours-value">{week.hours.toFixed(2)} h</span>
                          </div>
                          <div className="hours-row">
                            <span className="hours-label">Soll:</span>
                            <span className="hours-value">{(employee.workingHours || (employee.role === 'Vollzeit' ? 40 : 0)).toFixed(2)} h</span>
                          </div>
                        </div>
                        <div className="overtime-column">
                          <span className={`week-overtime ${week.overtime > 0 ? 'overtime-positive' : 'overtime-negative'}`}>
                            {week.overtime > 0 ? '+' : ''}{week.overtime.toFixed(2)} h
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="section detailed-shifts">
            <button 
              className={`section-toggle ${showDetailedList ? 'open' : ''}`}
              onClick={() => setShowDetailedList(!showDetailedList)}
            >
              <h4>Detaillierte Auflistung</h4>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 6L8 10L12 6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {showDetailedList && (
              <div className="section-content">
                <div className="shifts-list">
                  {detailedShifts.map((shift, index) => (
                    <div key={index} className="shift-item">
                      <div className="shift-date">{shift.date}</div>
                      <div className="shift-details">
                        <span className="shift-time">{shift.timeSlot}</span>
                        <span className="shift-type">{shift.type}</span>
                        <span className="shift-duration">{(shift.duration / 60).toFixed(2)} Stunden</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .working-hours-overview {
            padding: 20px;
          }
          
          .filter-section {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            align-items: center;
          }
          
          .form-select {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            min-width: 120px;
          }
          
          .export-buttons {
            display: flex;
            gap: 10px;
            margin-left: auto;
          }
          
          .button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background-color: #007bff;
            color: white;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .button:hover {
            background-color: #0056b3;
          }
          
          .summary-section {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 4px;
          }
          
          .total-hours {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin: 10px 0;
          }
          
          .shifts-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          .shifts-table th,
          .shifts-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          .shifts-table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          
          .shifts-table tr:hover {
            background-color: #f5f5f5;
          }
          
          .text-center {
            text-align: center;
          }

          .collapsible-sections {
            margin-top: 20px;
          }

          .section {
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 10px;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .section-toggle {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: none;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .section-toggle:hover {
            background-color: #f5f5f5;
          }

          .section-toggle h4 {
            margin: 0;
            font-size: 1.1em;
            color: #333;
          }

          .section-toggle svg {
            transition: transform 0.3s ease;
            opacity: 0.6;
          }

          .section-toggle:hover svg {
            opacity: 1;
          }

          .section-toggle.open svg {
            transform: rotate(180deg);
            opacity: 1;
          }

          .section-content {
            border-top: 1px solid #eee;
            padding: 15px;
          }

          .weekly-hours-list,
          .shifts-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .weekly-hours-item,
          .shift-item {
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 4px;
            background-color: #f9f9f9;
          }

          .weekly-hours-item:hover,
          .shift-item:hover {
            background-color: #f5f5f5;
          }
        `}</style>
      </div>
    </Modal>
  );
}

// Hilfsfunktion zur Berechnung der Arbeitstage im Monat
function getWorkingDaysInMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let workingDays = 0;

  for (let day = firstDay; day <= lastDay; day.setDate(day.getDate() + 1)) {
    if (!isWeekend(day)) {
      workingDays++;
    }
  }

  return workingDays;
}

export default WorkingHoursOverview; 