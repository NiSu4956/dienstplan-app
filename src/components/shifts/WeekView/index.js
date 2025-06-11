import React, { useState, useMemo } from 'react';
import WeekHeader from './WeekHeader';
import WeekGrid from './WeekGrid';
import DocumentationModal from './DocumentationModal';
import ShiftAssignmentForm from '../ShiftAssignmentForm';
import { 
  handleShiftSave as handleShiftSaveUtil,
  updateScheduleWithNewShift,
  deleteShiftFromSchedule
} from '../../../utils/shiftManagement';
import {
  addDocumentationToShift,
  updateDocumentationInShift,
  deleteDocumentationFromShift
} from '../../../utils/documentationManagement';
import { exportScheduleAsPDF } from '../../../utils/pdfExport';

function WeekView({ 
  employees, 
  shiftTypes, 
  scheduleData, 
  setScheduleData, 
  isEditable = false, 
  currentUser, 
  children 
}) {
  const [selectedWeek, setSelectedWeek] = useState('KW 01 (30.12.2024 - 05.01.2025)');
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isDocumentationModalOpen, setIsDocumentationModalOpen] = useState(false);
  const [selectedShiftData, setSelectedShiftData] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  // Memoize the current date check to avoid unnecessary re-renders
  const getCurrentDateString = useMemo(() => {
    const calculateDate = (day, index) => {
      const dateString = getDateFromWeek(selectedWeek, selectedDay ? days.indexOf(selectedDay) : index);
      const isToday = isCurrentDay(dateString);
      return { dateString, isToday };
    };
    return calculateDate;
  }, [selectedWeek, selectedDay, days]);

  const weeks = useMemo(() => [
    // 2025
    'KW 01 (30.12.2024 - 05.01.2025)',
    // ... (rest of the weeks)
  ], []);

  const handleWeekChange = (direction, week) => {
    if (direction === 'select') {
      setSelectedWeek(week);
    } else {
      const currentIndex = weeks.indexOf(selectedWeek);
      const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (newIndex >= 0 && newIndex < weeks.length) {
        setSelectedWeek(weeks[newIndex]);
      }
    }
  };

  const handleShiftClick = (shift, day, time) => {
    setSelectedShiftData({ shift, day, time });
    setIsShiftModalOpen(true);
  };

  const handleAddClick = (day, time) => {
    setSelectedShiftData({ day, time });
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async (shiftData) => {
    const result = await handleShiftSaveUtil(shiftData, scheduleData, selectedWeek);
    if (result.success) {
      setScheduleData(result.newScheduleData);
      setIsShiftModalOpen(false);
    }
  };

  const handleDeleteShift = (day, time, shiftId) => {
    const newScheduleData = deleteShiftFromSchedule(scheduleData, selectedWeek, day, shiftId);
    setScheduleData(newScheduleData);
  };

  const handleExport = () => {
    // CSV Export implementation
  };

  const handlePdfExport = () => {
    exportScheduleAsPDF(scheduleData[selectedWeek], employees, shiftTypes);
  };

  const handleSaveDocumentation = async (content) => {
    if (!selectedShiftData?.shift) return;
    
    const result = await addDocumentationToShift(
      selectedShiftData.shift.id,
      content,
      scheduleData,
      selectedWeek,
      selectedShiftData.day
    );
    
    if (result.success) {
      setScheduleData(result.newScheduleData);
    }
  };

  const handleUpdateDocumentation = async (docId, content) => {
    if (!selectedShiftData?.shift) return;
    
    const result = await updateDocumentationInShift(
      selectedShiftData.shift.id,
      docId,
      content,
      scheduleData,
      selectedWeek,
      selectedShiftData.day
    );
    
    if (result.success) {
      setScheduleData(result.newScheduleData);
    }
  };

  const handleDeleteDocumentation = async (docId) => {
    if (!selectedShiftData?.shift) return;
    
    const result = await deleteDocumentationFromShift(
      selectedShiftData.shift.id,
      docId,
      scheduleData,
      selectedWeek,
      selectedShiftData.day
    );
    
    if (result.success) {
      setScheduleData(result.newScheduleData);
    }
  };

  // Abwesenheiten separat verarbeiten
  const absences = useMemo(() => {
    if (!scheduleData[selectedWeek]) return {};
    
    const result = {};
    for (const day of days) {
      if (scheduleData[selectedWeek][day]) {
        // Alle Zeitslots durchsuchen für Abwesenheiten
        let dayAbsences = Object.values(scheduleData[selectedWeek][day])
          .flat()
          .filter((shift, index, self) => 
            shift?.isCustom && 
            (shift.type === 'vacation' || shift.type === 'sick') &&
            // Entferne Duplikate basierend auf der ID
            index === self.findIndex(s => s.id === shift.id)
          ) || [];

        // Filtere nach ausgewähltem Mitarbeiter
        if (selectedEmployee) {
          dayAbsences = dayAbsences.filter(absence => 
            absence.customEmployeeIds?.includes(parseInt(selectedEmployee))
          );
        }

        result[day] = dayAbsences;
      } else {
        result[day] = [];
      }
    }
    return result;
  }, [scheduleData, selectedWeek, days, selectedEmployee]);

  // Render der Abwesenheitszeile
  const renderAbsenceRow = (day) => {
    const dayAbsences = absences[day] || [];
    
    return (
      <div className="absence-row">
        {dayAbsences.map((absence) => (
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
    );
  };

  return (
    <div className="week-view">
      <WeekHeader
        selectedWeek={selectedWeek}
        weeks={weeks}
        onWeekChange={handleWeekChange}
        onExport={handleExport}
        onPdfExport={handlePdfExport}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        employees={employees}
      />
      
      <div className="schedule-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="schedule-header time-column">Zeit</th>
              {days.map((day, index) => {
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
              {days.map((day) => (
                <th key={day} className={`schedule-header ${selectedDay ? 'full-width' : ''}`}>
                  {renderAbsenceRow(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <WeekGrid
              selectedWeek={selectedWeek}
              scheduleData={scheduleData}
              shiftTypes={shiftTypes}
              employees={employees}
              selectedShiftId={selectedShiftId}
              isEditable={isEditable}
              onShiftClick={handleShiftClick}
              onAddClick={handleAddClick}
              currentUser={currentUser}
              selectedEmployee={selectedEmployee}
            />
          </tbody>
        </table>
      </div>

      {isShiftModalOpen && (
        <ShiftAssignmentForm
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          shiftData={selectedShiftData?.shift}
          day={selectedShiftData?.day}
          time={selectedShiftData?.time}
          employees={employees}
          shiftTypes={shiftTypes}
          onSave={handleSaveShift}
          onDelete={() => handleDeleteShift(
            selectedShiftData.day,
            selectedShiftData.time,
            selectedShiftData.shift.id
          )}
        />
      )}

      <DocumentationModal
        isOpen={isDocumentationModalOpen}
        onClose={() => setIsDocumentationModalOpen(false)}
        selectedShift={selectedShiftData?.shift}
        onSave={handleSaveDocumentation}
        onUpdate={handleUpdateDocumentation}
        onDelete={handleDeleteDocumentation}
      />

      {children}
    </div>
  );
}

export default WeekView; 