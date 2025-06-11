import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import ShiftAssignmentForm from '../shifts/ShiftAssignmentForm';
import ScheduleCell from './ScheduleCell';
import WeekNavigation from './WeekNavigation';
import ShiftManagement from './ShiftManagement';
import DocumentationManagement from '../documentation/DocumentationManagement';
import ExportControls from '../export/ExportControls';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../constants/dateFormats';
import { getCurrentWeek } from '../../utils/shiftUtils';

function WeekView({ employees, shiftTypes, scheduleData, setScheduleData, isEditable = false, currentUser, children }) {
  const days = useMemo(() => DAYS_OF_WEEK, []);
  const timeSlots = useMemo(() => TIME_SLOTS, []);
  
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const shiftManagement = ShiftManagement({
    scheduleData,
    setScheduleData,
    employees,
    shiftTypes,
    onShiftSave: () => setShowShiftModal(false),
    onShiftDelete: () => setSelectedShiftId(null)
  });

  const documentationManagement = DocumentationManagement({
    scheduleData,
    setScheduleData,
    onDocumentationSave: () => {},
    onDocumentationUpdate: () => {},
    onDocumentationDelete: () => {}
  });

  const exportControls = ExportControls({
    scheduleData,
    currentWeek,
    currentYear,
    onExport: () => {}
  });

  const handleWeekChange = (direction) => {
    if (direction === 'prev') {
      setCurrentWeek(prev => prev > 1 ? prev - 1 : 52);
      setCurrentYear(prev => currentWeek === 1 ? prev - 1 : prev);
    } else {
      setCurrentWeek(prev => prev < 52 ? prev + 1 : 1);
      setCurrentYear(prev => currentWeek === 52 ? prev + 1 : prev);
    }
  };

  const handleShiftClick = (shift, day, time) => {
    setSelectedShiftId(shift.id);
    setSelectedDay(day);
    setSelectedTime(time);
    setShowShiftModal(true);
  };

  const handleAddClick = (day, time) => {
    setSelectedShiftId(null);
    setSelectedDay(day);
    setSelectedTime(time);
    setShowShiftModal(true);
  };

  return (
    <div className="week-view">
      <WeekNavigation
        currentWeek={currentWeek}
        currentYear={currentYear}
        onWeekChange={handleWeekChange}
        onExport={exportControls.handleExport}
        onPdfExport={exportControls.handlePdfExport}
      />
      
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Zeit</th>
            {days.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={time}>
              <td className="time-slot">{time}</td>
              {days.map(day => (
                <ScheduleCell
                  key={`${day}-${time}`}
                  day={day}
                  time={time}
                  isFirstRow={timeIndex === 0}
                  shifts={scheduleData[day]?.[time] || []}
                  shiftTypes={shiftTypes}
                  employees={employees}
                  selectedShiftId={selectedShiftId}
                  isEditable={isEditable}
                  onShiftClick={handleShiftClick}
                  onAddClick={handleAddClick}
                  isFullWidth={false}
                  currentUser={currentUser}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {showShiftModal && (
        <Modal onClose={() => setShowShiftModal(false)}>
          <ShiftAssignmentForm
            shiftId={selectedShiftId}
            day={selectedDay}
            time={selectedTime}
            employees={employees}
            shiftTypes={shiftTypes}
            onSave={shiftManagement.handleSaveShift}
            onDelete={shiftManagement.handleDeleteShift}
            onClose={() => setShowShiftModal(false)}
          />
        </Modal>
      )}

      {children}
    </div>
  );
}

export default WeekView; 