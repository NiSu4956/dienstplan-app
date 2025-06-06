import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { jsPDF } from 'jspdf';

function WorkingHoursOverview({ employee, scheduleData, shiftTypes, onClose }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyHours, setMonthlyHours] = useState(0);
  const [detailedShifts, setDetailedShifts] = useState([]);

  useEffect(() => {
    calculateMonthlyHours();
  }, [selectedMonth, selectedYear, employee, scheduleData]);

  const calculateMonthlyHours = () => {
    console.log('Berechne Stunden für:', {
      employee,
      month: selectedMonth,
      year: selectedYear,
      scheduleData
    });

    let totalMinutes = 0;
    const shiftsArray = [];

    // Gehe durch alle Wochen im scheduleData
    Object.entries(scheduleData).forEach(([week, weekData]) => {
      console.log('Verarbeite Woche:', week);
      
      // Extrahiere Start- und Enddatum aus der Woche (z.B. "KW 22 (26.05 - 01.06.2025)")
      const dateRangeMatch = week.match(/KW \d+ \((\d{2}\.\d{2})\s*-\s*(\d{2}\.\d{2})\.(\d{4})\)/);
      if (!dateRangeMatch) {
        console.log('Kein gültiges Datumsformat gefunden in:', week);
        return;
      }

      const [_, startDateStr, endDateStr, yearStr] = dateRangeMatch;
      const year = parseInt(yearStr);
      
      // Parse Startdatum
      const [startDay, startMonth] = startDateStr.split('.').map(Number);
      const weekStartDate = new Date(year, startMonth - 1, startDay);
      
      console.log('Woche beginnt am:', weekStartDate);
      
      // Gehe durch alle Tage
      Object.entries(weekData).forEach(([day, dayData]) => {
        // Berechne das tatsächliche Datum für diesen Tag
        const dayIndex = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].indexOf(day);
        if (dayIndex === -1) {
          console.log('Ungültiger Wochentag:', day);
          return;
        }
        
        const currentDate = new Date(weekStartDate);
        currentDate.setDate(weekStartDate.getDate() + dayIndex);
        
        console.log('Verarbeite Tag:', {
          date: currentDate,
          month: currentDate.getMonth(),
          selectedMonth,
          year: currentDate.getFullYear(),
          selectedYear,
          day,
          dayData
        });

        // Prüfe, ob der Tag im ausgewählten Monat und Jahr liegt
        if (currentDate.getMonth() !== selectedMonth || currentDate.getFullYear() !== selectedYear) {
          console.log('Tag liegt nicht im ausgewählten Monat/Jahr');
          return;
        }

        // Gehe durch alle Zeitslots
        Object.entries(dayData).forEach(([timeSlot, shifts]) => {
          console.log('Verarbeite Zeitslot:', timeSlot, 'mit Schichten:', shifts);
          
          // Finde Schichten des Mitarbeiters
          shifts.forEach(shift => {
            console.log('Prüfe Schicht:', {
              shift,
              employeeId: employee.id,
              isCustom: shift.isCustom,
              customEmployeeIds: shift.customEmployeeIds,
              employeeIdInShift: shift.employeeId
            });

            if (isEmployeeShift(shift, employee.id)) {
              const shiftDuration = calculateShiftDuration(shift, shiftTypes);
              console.log('Gefundene Schicht für Mitarbeiter:', {
                duration: shiftDuration,
                timeRange: getShiftTimeRange(shift, shiftTypes),
                type: getShiftType(shift, shiftTypes)
              });

              totalMinutes += shiftDuration;

              // Füge detaillierte Schichtinformation hinzu
              shiftsArray.push({
                date: formatDate(currentDate),
                timeSlot: getShiftTimeRange(shift, shiftTypes),
                duration: shiftDuration,
                type: getShiftType(shift, shiftTypes)
              });
            }
          });
        });
      });
    });

    console.log('Berechnungsergebnis:', {
      totalMinutes,
      hours: totalMinutes / 60,
      shiftsFound: shiftsArray
    });

    setMonthlyHours(totalMinutes / 60); // Konvertiere zu Stunden
    setDetailedShifts(shiftsArray.sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const isEmployeeShift = (shift, employeeId) => {
    if (!shift) return false;
    const isMatch = shift.isCustom 
      ? shift.customEmployeeIds?.includes(parseInt(employeeId))
      : parseInt(shift.employeeId) === parseInt(employeeId);
    
    console.log('Prüfe Mitarbeiter-Match:', {
      shift,
      employeeId,
      isCustom: shift.isCustom,
      customEmployeeIds: shift.customEmployeeIds,
      shiftEmployeeId: shift.employeeId,
      isMatch
    });
    
    return isMatch;
  };

  const calculateShiftDuration = (shift, shiftTypes) => {
    if (shift.isCustom) {
      if (!shift.customStartTime || !shift.customEndTime) return 0;
      const duration = calculateTimeDifference(shift.customStartTime, shift.customEndTime);
      console.log('Berechne Dauer für Custom-Schicht:', {
        start: shift.customStartTime,
        end: shift.customEndTime,
        duration
      });
      return duration;
    }

    const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
    if (!shiftType || !shiftType.startTime || !shiftType.endTime) return 0;
    
    const duration = calculateTimeDifference(shiftType.startTime, shiftType.endTime);
    console.log('Berechne Dauer für Standard-Schicht:', {
      shiftType,
      start: shiftType.startTime,
      end: shiftType.endTime,
      duration
    });
    return duration;
  };

  const calculateTimeDifference = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Für Schichten über Mitternacht
    
    return totalMinutes;
  };

  const getShiftTimeRange = (shift, shiftTypes) => {
    if (shift.isCustom) {
      return `${shift.customStartTime} - ${shift.customEndTime}`;
    }

    const shiftType = shiftTypes.find(t => t.id === shift.shiftTypeId);
    return shiftType ? `${shiftType.startTime} - ${shiftType.endTime}` : '';
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
    try {
      // Erstelle ein neues PDF-Dokument (A4)
      const doc = new jsPDF();
      
      // Füge deutsche Schriftart hinzu für Umlaute
      doc.setFont("helvetica");
      
      // Titel
      doc.setFontSize(16);
      doc.text(`Stundenübersicht - ${employee.name}`, 14, 20);
      doc.setFontSize(12);
      doc.text(`${months[selectedMonth]} ${selectedYear}`, 14, 30);
      doc.text(`Gesamtstunden: ${monthlyHours.toFixed(2)}`, 14, 40);

      // Tabellendaten vorbereiten
      const tableData = detailedShifts.map(shift => [
        shift.date,
        shift.timeSlot,
        shift.type,
        (shift.duration / 60).toFixed(2)
      ]);

      // Manuelle Tabellenerstellung
      const startY = 50;
      const cellPadding = 5;
      const columnWidths = [40, 40, 60, 30];
      const rowHeight = 10;
      
      // Header
      doc.setFillColor(66, 139, 202);
      doc.setTextColor(255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      
      let currentX = 14;
      let currentY = startY;
      
      ['Datum', 'Uhrzeit', 'Schichttyp', 'Stunden'].forEach((header, index) => {
        doc.rect(currentX, currentY, columnWidths[index], rowHeight, 'F');
        doc.text(header, currentX + cellPadding, currentY + rowHeight - 2);
        currentX += columnWidths[index];
      });
      
      // Daten
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
      
      tableData.forEach((row, rowIndex) => {
        currentY = startY + (rowIndex + 1) * rowHeight;
        currentX = 14;
        
        // Alternierende Zeilenfarben
        if (rowIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(currentX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        
        row.forEach((cell, cellIndex) => {
          doc.rect(currentX, currentY, columnWidths[cellIndex], rowHeight);
          doc.text(cell.toString(), currentX + cellPadding, currentY + rowHeight - 2);
          currentX += columnWidths[cellIndex];
        });
      });
      
      // Gesamtstunden (Footer)
      currentY += rowHeight;
      doc.setFillColor(240, 240, 240);
      doc.setFont("helvetica", "bold");
      
      const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
      doc.rect(14, currentY, totalWidth, rowHeight, 'F');
      doc.text('Gesamtstunden', 14 + cellPadding, currentY + rowHeight - 2);
      doc.text(monthlyHours.toFixed(2), 14 + totalWidth - 30, currentY + rowHeight - 2);

      // PDF speichern
      doc.save(`Stundenübersicht_${employee.name}_${months[selectedMonth]}_${selectedYear}.pdf`);
      
      console.log('PDF erfolgreich erstellt');
    } catch (error) {
      console.error('Detaillierter Fehler beim PDF-Export:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Beim Erstellen des PDFs ist ein Fehler aufgetreten: ${error.message}`);
    }
  };

  const downloadAsCSV = () => {
    // CSV Header
    let csvContent = "Datum;Uhrzeit;Schichttyp;Stunden\n";

    // CSV Daten
    detailedShifts.forEach(shift => {
      csvContent += `${shift.date};${shift.timeSlot};${shift.type};${(shift.duration / 60).toFixed(2)}\n`;
    });

    // Gesamtstunden
    csvContent += `\nGesamtstunden;${monthlyHours.toFixed(2)}`;

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Stundenübersicht_${employee.name}_${months[selectedMonth]}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h3>Gesamtstunden im {months[selectedMonth]} {selectedYear}</h3>
          <p className="total-hours">{monthlyHours.toFixed(2)} Stunden</p>
        </div>

        <div className="shifts-section">
          <h4>Detaillierte Übersicht</h4>
          <table className="shifts-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Uhrzeit</th>
                <th>Schichttyp</th>
                <th>Stunden</th>
              </tr>
            </thead>
            <tbody>
              {detailedShifts.map((shift, index) => (
                <tr key={index}>
                  <td>{shift.date}</td>
                  <td>{shift.timeSlot}</td>
                  <td>{shift.type}</td>
                  <td>{(shift.duration / 60).toFixed(2)}</td>
                </tr>
              ))}
              {detailedShifts.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">
                    Keine Schichten in diesem Monat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        `}</style>
      </div>
    </Modal>
  );
}

export default WorkingHoursOverview; 