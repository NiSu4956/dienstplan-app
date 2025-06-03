import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Modal from './common/Modal';
import ShiftAssignmentForm from './shifts/ShiftAssignmentForm';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  organizeOverlappingShifts, 
  getTimeInMinutes, 
  calculateShiftPosition,
  checkEmployeeAvailability,
  checkDuplicateShifts,
  getDateFromWeek,
  getCurrentWeek,
  isCurrentDay
} from '../utils/shiftUtils';
import '../styles/WeekView.css';
import { format, parse, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import ShiftModal from './ShiftModal';
import { validateShiftAssignment } from '../utils/shiftUtils';

// Memoized Shift Card Component
const ShiftCard = memo(({ 
  shift, 
  shiftType,
  employees, 
  isSelected, 
  isEditable, 
  onShiftClick, 
  style,
  currentUser 
}) => {
  const isCustom = shift.isCustom;
  const isAbsence = isCustom && (shift.type === 'vacation' || shift.type === 'sick');
  const isUserShift = currentUser && (
    (isCustom && shift.customEmployeeIds?.includes(currentUser.id)) ||
    (!isCustom && shift.employeeId === currentUser.id)
  );
  const cardClassName = `shift-card ${isCustom ? `custom-entry shift-${shift.type}` : `shift-${shiftType?.color || 'gray'}`} ${isAbsence ? 'absence-entry' : ''} ${isSelected ? 'selected' : ''} ${isUserShift ? 'user-shift' : ''}`;

  // Hilfsfunktion zum Formatieren der Mitarbeiternamen
  const getEmployeeNames = () => {
    if (!isCustom || !shift.customEmployeeIds) return shift.name;
    
    return shift.customEmployeeIds
      .map(empId => {
        const employee = employees.find(e => e.id === parseInt(empId));
        return employee ? employee.name : '';
      })
      .filter(name => name)
      .join(', ');
  };

  return (
    <div
      className={cardClassName}
      style={style}
      onClick={(isEditable || isUserShift) ? onShiftClick : undefined}
      title={isUserShift && !isEditable ? "Klicken Sie hier, um Details zu Ihrer Schicht zu sehen" : undefined}
    >
      <div className="shift-header">
        {isAbsence ? (
          <div className="absence-header">
            <span className="absence-type">
              {shift.type === 'vacation' ? (
                <>
                  <span className="absence-icon">🏖️</span>
                  <span className="absence-employee-name">{getEmployeeNames()} - Urlaub</span>
                </>
              ) : (
                <>
                  <span className="absence-icon">🤒</span>
                  <span className="absence-employee-name">{getEmployeeNames()} - Krank</span>
                </>
              )}
            </span>
          </div>
        ) : (
          <>
            <div className="shift-type">
              {isCustom ? shift.customTitle : shiftType?.name}
            </div>
            <div className="shift-employee">
              {getEmployeeNames()}
            </div>
            {shift.tasks?.length > 0 && (
              <div className="shift-notes">
                <strong>Aufgaben:</strong> {shift.tasks.join(', ')}
              </div>
            )}
            {shift.notes && (
              <div className="shift-notes">{shift.notes}</div>
            )}
          </>
        )}
      </div>
      {isSelected && isEditable && (
        <div className="shift-selected-indicator" />
      )}
    </div>
  );
});

// Memoized Schedule Cell Component
const ScheduleCell = memo(({ 
  day, 
  time, 
  isFirstRow, 
  shifts, 
  shiftTypes, 
  employees, 
  selectedShiftId,
  isEditable,
  onShiftClick,
  onAddClick,
  isFullWidth,
  currentUser
}) => {
  return (
    <td className={`schedule-cell ${isFullWidth ? 'full-width' : ''}`}>
      {isFirstRow && shifts && (
        <div className="day-container">
          {shifts.map(shift => {
            const shiftType = !shift.isCustom ? shiftTypes.find(t => t.id === shift.shiftTypeId) : null;
            return (
              <ShiftCard
                key={shift.id}
                shift={shift}
                shiftType={shiftType}
                employees={employees}
                isSelected={selectedShiftId === shift.id}
                isEditable={isEditable}
                onShiftClick={() => onShiftClick(shift, day, time)}
                style={{
                  position: 'absolute',
                  top: `${shift.top}px`,
                  height: `${shift.height}px`,
                  width: shift.width,
                  left: shift.left
                }}
                currentUser={currentUser}
              />
            );
          })}
        </div>
      )}
      {isEditable && (
        <button 
          className="add-shift-button" 
          onClick={() => onAddClick(day, time)}
        >+</button>
      )}
    </td>
  );
});

function WeekView({ employees, shiftTypes, scheduleData, setScheduleData, isEditable = false, currentUser }) {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    return format(today, "'KW' ww '('dd.MM - dd.MM.yyyy')'", { locale: de });
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [modalData, setModalData] = useState({ day: '', time: '' });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  const days = useMemo(() => ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'], []);
  const timeSlots = useMemo(() => [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00'
  ], []);

  // Effekt zum Aktualisieren der ausgewählten Woche, wenn sich das Datum ändert
  useEffect(() => {
    const interval = setInterval(() => {
      const currentWeek = getCurrentWeek();
      if (currentWeek !== selectedWeek) {
        setSelectedWeek(currentWeek);
      }
    }, 60000); // Prüfe jede Minute

    return () => clearInterval(interval);
  }, [selectedWeek]);

  // Füge einen Click-Handler zum Hintergrund hinzu
  useEffect(() => {
    const handleBackgroundClick = (e) => {
      // Prüfe, ob das geklickte Element oder seine Eltern die Klasse 'shift-card' haben
      let target = e.target;
      while (target) {
        if (target.classList && target.classList.contains('shift-card')) {
          return;
        }
        target = target.parentElement;
      }
      setSelectedShiftId(null);
    };

    document.addEventListener('click', handleBackgroundClick);
    return () => {
      document.removeEventListener('click', handleBackgroundClick);
    };
  }, []);

  // Memoized helper functions
  const handleShiftClick = useCallback((shift, day, time) => {
    setSelectedShiftId(shift.id);
    const isUserShift = currentUser && (
      (shift.isCustom && shift.customEmployeeIds?.includes(currentUser.id)) ||
      (!shift.isCustom && shift.employeeId === currentUser.id)
    );
    if (isEditable || isUserShift) {
      setCurrentShift(shift);
      setModalData({ day, time });
      setModalOpen(true);
    }
  }, [isEditable, currentUser]);
  
  const handleAddShift = useCallback((day, time) => {
    setModalData({ day, time });
    setCurrentShift(null);
    setModalOpen(true);
  }, []);

  // Memoized data calculations
  const organizedShifts = useMemo(() => {
    if (!scheduleData[selectedWeek]) return {};
    
    const result = {};
    for (const day of days) {
      if (scheduleData[selectedWeek][day]) {
        const dayShifts = Object.values(scheduleData[selectedWeek][day])
          .flat()
          .filter((shift, index, self) => 
            // Entferne Duplikate und filtere Urlaub/Krankheit aus
            index === self.findIndex(s => s.id === shift.id) &&
            !(shift.isCustom && (shift.type === 'vacation' || shift.type === 'sick'))
          );
          
        if (selectedEmployee) {
          const filteredShifts = dayShifts.filter(shift => {
            if (shift.isCustom) {
              return shift.customEmployeeIds?.includes(parseInt(selectedEmployee));
            }
            return shift.employeeId === parseInt(selectedEmployee);
          });
          result[day] = organizeOverlappingShifts(filteredShifts, shiftTypes, timeSlots);
        } else {
          result[day] = organizeOverlappingShifts(dayShifts, shiftTypes, timeSlots);
        }
      }
    }
    return result;
  }, [scheduleData, selectedWeek, selectedEmployee, days, shiftTypes, timeSlots]);

  // Memoize the current date check to avoid unnecessary re-renders
  const getCurrentDateString = useCallback((day, index) => {
    const dateString = getDateFromWeek(selectedWeek, selectedDay ? days.indexOf(selectedDay) : index);
    const isToday = isCurrentDay(dateString);
    return { dateString, isToday };
  }, [selectedWeek, selectedDay, days]);

  // Schicht-Funktionen
  const handleSaveShift = (shiftData) => {
    const { 
      date, 
      time, 
      employeeId, 
      shiftTypeId, 
      notes, 
      isCustom, 
      customTitle, 
      customStartTime, 
      customEndTime, 
      customColor,
      customEmployeeIds 
    } = shiftData;
    
    // Prüfe auf doppelte Schichten
    if (!isCustom && checkDuplicateShifts(date, parseInt(shiftTypeId), currentShift?.id, scheduleData, selectedWeek)) {
      const shiftType = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
      alert(`Diese Schicht (${shiftType?.name}) wurde bereits für diesen Tag vergeben!`);
      return;
    }

    // Erstelle temporäre Schicht für Verfügbarkeitsprüfung
    const tempShift = {
      isCustom,
      customStartTime,
      customEndTime,
      shiftTypeId: parseInt(shiftTypeId),
      employeeId: parseInt(employeeId)
    };

    // Prüfe Verfügbarkeit für alle betroffenen Mitarbeiter
    const employeesToCheck = isCustom ? customEmployeeIds : [employeeId];
    
    for (const empId of employeesToCheck) {
      const availability = checkEmployeeAvailability(
        parseInt(empId),
        tempShift,
        currentShift?.id,
        scheduleData,
        selectedWeek,
        modalData.day,
        shiftTypes
      );

      if (!availability.available) {
        const conflictingShiftType = availability.conflictingShift.isCustom 
          ? null 
          : shiftTypes.find(t => t.id === availability.conflictingShift.shiftTypeId);

        alert(`${availability.employee.name} ist bereits in einer anderen Schicht eingeteilt:\n` +
          `${availability.conflictingShift.isCustom 
            ? availability.conflictingShift.customTitle 
            : conflictingShiftType?.name
          } (${availability.conflictingShift.isCustom 
            ? `${availability.conflictingShift.customStartTime} - ${availability.conflictingShift.customEndTime}`
            : `${conflictingShiftType?.startTime} - ${conflictingShiftType?.endTime}`
          })`);
        return;
      }
    }
    
    let newShift;
    
    if (isCustom) {
      // Stelle sicher, dass die IDs als Zahlen gespeichert werden
      const employeeIdsAsNumbers = (customEmployeeIds || []).map(id => parseInt(id));
      const mainEmployee = employees.find(e => e.id === employeeIdsAsNumbers[0]);
      
      newShift = {
        id: currentShift ? currentShift.id : Date.now(),
        isCustom: true,
        customTitle,
        customStartTime,
        customEndTime,
        customColor,
        customEmployeeIds: employeeIdsAsNumbers,
        notes,
        type: customColor,
        name: mainEmployee ? mainEmployee.name : customTitle
      };
    } else {
    const employee = employees.find(e => e.id === parseInt(employeeId));
    const shiftType = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
    
    if (!employee || !shiftType) return;
    
      newShift = {
      id: currentShift ? currentShift.id : Date.now(),
      employeeId: parseInt(employeeId),
      name: employee.name,
      shiftTypeId: parseInt(shiftTypeId),
      task: shiftType.name,
      tasks: shiftType.tasks || [],
      type: shiftType.color,
      notes,
      isCustom: false
    };
    }
    
    setScheduleData(prev => {
      const newData = { ...prev };
      
      // Wenn es sich um eine Bearbeitung handelt, entferne den alten Eintrag
      if (currentShift) {
        if (newData[selectedWeek]?.[date]) {
          Object.keys(newData[selectedWeek][date]).forEach(timeSlot => {
            newData[selectedWeek][date][timeSlot] = newData[selectedWeek][date][timeSlot]
              .filter(shift => shift.id !== currentShift.id);
            
            if (newData[selectedWeek][date][timeSlot].length === 0) {
              delete newData[selectedWeek][date][timeSlot];
            }
          });
          
          if (Object.keys(newData[selectedWeek][date]).length === 0) {
            delete newData[selectedWeek][date];
          }
        }
      }
      
      // Füge den neuen/bearbeiteten Eintrag hinzu
      if (!newData[selectedWeek]) newData[selectedWeek] = {};
      if (!newData[selectedWeek][date]) newData[selectedWeek][date] = {};
      if (!newData[selectedWeek][date][time]) newData[selectedWeek][date][time] = [];
      
      newData[selectedWeek][date][time].push(newShift);
      
      return newData;
    });
    
    setModalOpen(false);
    setCurrentShift(null);
  };
  
  const handleDeleteShift = (day, time, shiftId) => {
    setScheduleData(prev => {
      const newData = { ...prev };
      
      // Wenn es sich um einen Urlaubs- oder Krankheitseintrag handelt, 
      // oder wir in der Tagesansicht sind,
      // müssen wir in allen Zeitslots des Tages suchen
      if (newData[selectedWeek]?.[day]) {
        // Durchsuche alle Zeitslots des Tages
        Object.keys(newData[selectedWeek][day]).forEach(timeSlot => {
          if (newData[selectedWeek][day][timeSlot]) {
            const filteredShifts = newData[selectedWeek][day][timeSlot].filter(s => s.id !== shiftId);
            if (filteredShifts.length === 0) {
              delete newData[selectedWeek][day][timeSlot];
            } else {
              newData[selectedWeek][day][timeSlot] = filteredShifts;
            }
          }
        });

        // Bereinige leere Strukturen
        if (Object.keys(newData[selectedWeek][day]).length === 0) {
          delete newData[selectedWeek][day];
        }
        if (Object.keys(newData[selectedWeek]).length === 0) {
          delete newData[selectedWeek];
        }
      }
      
      return newData;
    });
  };
  
  // Navigation
  const goToPreviousWeek = () => {
    const currentIndex = weeks.indexOf(selectedWeek);
    if (currentIndex > 0) setSelectedWeek(weeks[currentIndex - 1]);
  };
  
  const goToNextWeek = () => {
    const currentIndex = weeks.indexOf(selectedWeek);
    if (currentIndex < weeks.length - 1) setSelectedWeek(weeks[currentIndex + 1]);
  };

  // Hilfsfunktion zum Filtern der Schichten nach Mitarbeiter
  const filterShiftsByEmployee = (shifts) => {
    if (!selectedEmployee) return shifts;
    
    return shifts.filter(shift => {
      if (shift.isCustom) {
        return shift.customEmployeeIds?.includes(parseInt(selectedEmployee));
      }
      return shift.employeeId === parseInt(selectedEmployee);
    });
  };

  // Export-Funktionen
const handleExport = () => {
  let csvContent = "Zeit;";
    days.forEach(day => csvContent += `${day};`);
  csvContent += "\n";
  
  timeSlots.forEach(time => {
    csvContent += `${time};`;
    days.forEach(day => {
        if (scheduleData[selectedWeek]?.[day]?.[time]) {
        const shifts = scheduleData[selectedWeek][day][time];
          const cellContent = shifts.map(shift => 
            `${shift.name} (${shift.task})${shift.notes ? ` - ${shift.notes}` : ''}`
          ).join(" / ");
        csvContent += `"${cellContent}";`;
      } else {
        csvContent += ";";
      }
    });
    csvContent += "\n";
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Dienstplan_${selectedWeek.replace(/\s/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
 
const handlePdfExport = () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  doc.setFontSize(16);
  doc.text(`Dienstplan ${selectedWeek}`, 14, 15);
  
  const tableHeaders = ['Zeit', ...days];
    const tableData = timeSlots.map(time => {
    const row = [time];
    days.forEach(day => {
      if (scheduleData[selectedWeek]?.[day]?.[time]) {
        const shifts = scheduleData[selectedWeek][day][time];
          const cellContent = shifts.map(shift => 
            `${shift.name} (${shift.task})${shift.notes ? `\n↪ ${shift.notes}` : ''}`
          ).join("\n");
        row.push(cellContent);
      } else {
        row.push('');
      }
    });
      return row;
  });
  
  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: 20,
    styles: { 
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    headStyles: { 
        fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: { 
        0: { cellWidth: 15 }
    },
    alternateRowStyles: { 
        fillColor: [245, 245, 245]
    },
    theme: 'grid',
    margin: { top: 20, right: 14, bottom: 20, left: 14 },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index > 0) {
        const text = data.cell.text.join('');
        if (text.includes('Frühdienst')) {
            data.cell.styles.fillColor = [219, 234, 254];
        } else if (text.includes('Tagesdienst')) {
            data.cell.styles.fillColor = [220, 252, 231];
        } else if (text.includes('Spätdienst')) {
            data.cell.styles.fillColor = [243, 232, 255];
        } else if (text.includes('Nachtdienst')) {
            data.cell.styles.fillColor = [229, 231, 235];
        } else if (text.includes('Kochen')) {
            data.cell.styles.fillColor = [254, 226, 226];
        } else if (text.includes('Wochenende')) {
            data.cell.styles.fillColor = [254, 249, 195];
        }
      }
    }
  });
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const today = new Date().toLocaleDateString('de-DE');
    doc.setFontSize(8);
    doc.text(`Erstellt am: ${today} | Seite ${i} von ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`Dienstplan_${selectedWeek.replace(/\s/g, '_')}.pdf`);
};

  // Render
  return (
    <div className="card">
      <div className="card-header">
  <div className="title-container">
    <h2 className="card-title">Übersicht</h2>
        </div>
        <div className="card-actions">
          <div className="filter-container">
            <select
              className="filter-select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Alle Mitarbeiter</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="">Alle Tage</option>
              {days.map((day, index) => (
                <option key={day} value={day}>
                  {day} ({getDateFromWeek(selectedWeek, index)})
                </option>
              ))}
            </select>
    </div>
    <div className="week-navigation">
      <button
        className="week-nav-button"
        onClick={goToPreviousWeek}
        disabled={weeks.indexOf(selectedWeek) === 0}
      >◀</button>
      <select
              className="filter-select"
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
      >
        {weeks.map((week) => (
          <option key={week} value={week}>{week}</option>
        ))}
      </select>
      <button
        className="week-nav-button"
        onClick={goToNextWeek}
        disabled={weeks.indexOf(selectedWeek) === weeks.length - 1}
      >▶</button>
    </div>
          {isEditable && (
    <div className="export-buttons">
      <button className="button" onClick={handleExport}>CSV</button>
      <button className="button" onClick={handlePdfExport}>PDF</button>
                    </div>
          )}
        </div>
      </div>
      
      <div className="schedule-container">
    <table className="schedule-table">
      <thead>
        <tr>
          <th className="schedule-header time-column">Zeit</th>
              {(selectedDay ? [selectedDay] : days).map((day, index) => {
                const { dateString, isToday } = getCurrentDateString(day, index);
                return (
                  <th key={day} className={`schedule-header ${selectedDay ? 'full-width' : ''}`}>
                    <div className={`day-header ${isToday ? 'current-day' : ''}`}>
                      <div className="day-name">{day}</div>
                      <div className="day-date">{dateString}</div>
                    </div>
                  </th>
                );
              })}
        </tr>
        <tr>
          <th className="schedule-header time-column">Abwesenheit</th>
          {(selectedDay ? [selectedDay] : days).map((day) => {
            const absences = scheduleData[selectedWeek]?.[day]?.['07:00']?.filter(
              shift => shift.isCustom && (shift.type === 'vacation' || shift.type === 'sick')
            ) || [];
            
            return (
              <th key={day} className={`schedule-header ${selectedDay ? 'full-width' : ''}`}>
                <div className="absence-row">
                  {absences.map((absence, index) => (
                    <div
                      key={absence.id}
                      className={`absence-badge ${absence.type === 'vacation' ? 'vacation' : 'sick'}`}
                      onClick={() => handleShiftClick(absence, day, '07:00')}
                    >
                      {absence.type === 'vacation' ? '🏖️ ' : '🏥 '}
                      {absence.name}
                    </div>
                  ))}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map((time, index) => (
          <tr key={time} className="schedule-row">
            <td className="schedule-time">{time}</td>
                {(selectedDay ? [selectedDay] : days).map((day) => (
                  <ScheduleCell
                    key={`${day}-${time}`}
                    day={day}
                    time={time}
                    isFirstRow={index === 0}
                    shifts={organizedShifts[day]}
                    shiftTypes={shiftTypes}
                    employees={employees}
                    selectedShiftId={selectedShiftId}
                    isEditable={isEditable}
                    onShiftClick={handleShiftClick}
                    onAddClick={handleAddShift}
                    isFullWidth={!!selectedDay}
                    currentUser={currentUser}
                  />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
</div>
    
      {isEditable && (
      <Modal 
        isOpen={modalOpen} 
          onClose={() => {
            setModalOpen(false);
            setSelectedShiftId(null);
          }}
          title={currentShift ? (
            currentShift.isCustom && (currentShift.type === 'vacation' || currentShift.type === 'sick') 
              ? `${currentShift.type === 'vacation' ? 'Urlaub' : 'Krankmeldung'} bearbeiten` 
              : "Schicht bearbeiten"
          ) : "Schicht hinzufügen"}
        >
          <div className="modal-content">
            <ShiftAssignmentForm 
              date={modalData.day}
              time={modalData.time}
              employees={employees}
              shiftTypes={shiftTypes}
              existingShift={currentShift}
              onSave={handleSaveShift}
              onCancel={() => {
                setModalOpen(false);
                setSelectedShiftId(null);
              }}
              scheduleData={scheduleData}
              selectedWeek={selectedWeek}
            />
            {currentShift && (
              <div className="modal-footer">
                <button
                  className="button delete"
                  onClick={() => {
                    const confirmMessage = currentShift.isCustom && (currentShift.type === 'vacation' || currentShift.type === 'sick')
                      ? `Möchten Sie diesen ${currentShift.type === 'vacation' ? 'Urlaubseintrag' : 'Krankheitseintrag'} wirklich löschen?`
                      : 'Möchten Sie diese Schicht wirklich löschen?';
                    
                    if (window.confirm(confirmMessage)) {
                      handleDeleteShift(modalData.day, modalData.time, currentShift.id);
                      setModalOpen(false);
                      setSelectedShiftId(null);
                    }
                  }}
                >
                  {currentShift.isCustom && (currentShift.type === 'vacation' || currentShift.type === 'sick')
                    ? `${currentShift.type === 'vacation' ? 'Urlaub' : 'Krankmeldung'} löschen`
                    : 'Schicht löschen'}
                </button>
              </div>
            )}
          </div>
      </Modal>
      )}
      {(!isEditable && modalOpen) && (
        <Modal 
          isOpen={modalOpen} 
          onClose={() => {
            setModalOpen(false);
            setSelectedShiftId(null);
          }}
          title="Schichtdetails"
        >
          <div className="modal-content">
            <div className="shift-details">
              <p><strong>Schichttyp:</strong> {currentShift?.isCustom ? currentShift.customTitle : shiftTypes.find(t => t.id === currentShift?.shiftTypeId)?.name}</p>
              <p><strong>Datum:</strong> {modalData.day}</p>
              <p><strong>Uhrzeit:</strong> {currentShift?.isCustom ? `${currentShift.customStartTime} - ${currentShift.customEndTime}` : modalData.time}</p>
              {currentShift?.tasks?.length > 0 && (
                <p><strong>Aufgaben:</strong> {currentShift.tasks.join(', ')}</p>
              )}
              {currentShift?.notes && (
                <p><strong>Notizen:</strong> {currentShift.notes}</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="button secondary" onClick={() => {
                setModalOpen(false);
                setSelectedShiftId(null);
              }}>
                Schließen
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default memo(WeekView);