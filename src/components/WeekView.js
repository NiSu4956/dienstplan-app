import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Modal from './common/Modal';
import ShiftAssignmentForm from './shifts/ShiftAssignmentForm';
import ShiftCard from './shifts/ShiftCard';
import { 
  organizeOverlappingShifts,
  checkEmployeeAvailability,
  checkDuplicateShifts,
  getDateFromWeek,
  getCurrentWeek,
  isCurrentDay
} from '../utils/shiftUtils';
import { formatDate, DATE_FORMATS } from '../utils/dateUtils';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../constants/dateFormats';
import { exportScheduleAsPDF } from '../utils/pdfExport';
import { 
  handleShiftSave as handleShiftSaveUtil,
  updateScheduleWithNewShift,
  deleteShiftFromSchedule,
  validateShiftAssignment,
  getEmployeeById,
  formatTimeSlot
} from '../utils/shiftManagement';
import {
  addDocumentationToShift,
  updateDocumentationInShift,
  deleteDocumentationFromShift
} from '../utils/documentationManagement';

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

function WeekView({ employees, shiftTypes, scheduleData, setScheduleData, isEditable = false, currentUser, children }) {
  const days = useMemo(() => DAYS_OF_WEEK, []);
  const timeSlots = useMemo(() => TIME_SLOTS, []);
  
  // Initialisiere weeks
  const [weeks] = useState([
    // 2025
    'KW 01 (30.12.2024 - 05.01.2025)',
    'KW 02 (06.01 - 12.01.2025)',
    'KW 03 (13.01 - 19.01.2025)',
    'KW 04 (20.01 - 26.01.2025)',
    'KW 05 (27.01 - 02.02.2025)',
    'KW 06 (03.02 - 09.02.2025)',
    'KW 07 (10.02 - 16.02.2025)',
    'KW 08 (17.02 - 23.02.2025)',
    'KW 09 (24.02 - 02.03.2025)',
    'KW 10 (03.03 - 09.03.2025)',
    'KW 11 (10.03 - 16.03.2025)',
    'KW 12 (17.03 - 23.03.2025)',
    'KW 13 (24.03 - 30.03.2025)',
    'KW 14 (31.03 - 06.04.2025)',
    'KW 15 (07.04 - 13.04.2025)',
    'KW 16 (14.04 - 20.04.2025)',
    'KW 17 (21.04 - 27.04.2025)',
    'KW 18 (28.04 - 04.05.2025)',
    'KW 19 (05.05 - 11.05.2025)',
    'KW 20 (12.05 - 18.05.2025)',
    'KW 21 (19.05 - 25.05.2025)',
    'KW 22 (26.05 - 01.06.2025)',
    'KW 23 (02.06 - 08.06.2025)',
    'KW 24 (09.06 - 15.06.2025)',
    'KW 25 (16.06 - 22.06.2025)',
    'KW 26 (23.06 - 29.06.2025)',
    'KW 27 (30.06 - 06.07.2025)',
    'KW 28 (07.07 - 13.07.2025)',
    'KW 29 (14.07 - 20.07.2025)',
    'KW 30 (21.07 - 27.07.2025)',
    'KW 31 (28.07 - 03.08.2025)',
    'KW 32 (04.08 - 10.08.2025)',
    'KW 33 (11.08 - 17.08.2025)',
    'KW 34 (18.08 - 24.08.2025)',
    'KW 35 (25.08 - 31.08.2025)',
    'KW 36 (01.09 - 07.09.2025)',
    'KW 37 (08.09 - 14.09.2025)',
    'KW 38 (15.09 - 21.09.2025)',
    'KW 39 (22.09 - 28.09.2025)',
    'KW 40 (29.09 - 05.10.2025)',
    'KW 41 (06.10 - 12.10.2025)',
    'KW 42 (13.10 - 19.10.2025)',
    'KW 43 (20.10 - 26.10.2025)',
    'KW 44 (27.10 - 02.11.2025)',
    'KW 45 (03.11 - 09.11.2025)',
    'KW 46 (10.11 - 16.11.2025)',
    'KW 47 (17.11 - 23.11.2025)',
    'KW 48 (24.11 - 30.11.2025)',
    'KW 49 (01.12 - 07.12.2025)',
    'KW 50 (08.12 - 14.12.2025)',
    'KW 51 (15.12 - 21.12.2025)',
    'KW 52 (22.12 - 28.12.2025)',
    'KW 53 (29.12.2025 - 04.01.2026)',
    
    // 2026
    'KW 01 (05.01 - 11.01.2026)',
    'KW 02 (12.01 - 18.01.2026)',
    'KW 03 (19.01 - 25.01.2026)',
    'KW 04 (26.01 - 01.02.2026)',
    'KW 05 (02.02 - 08.02.2026)',
    'KW 06 (09.02 - 15.02.2026)',
    'KW 07 (16.02 - 22.02.2026)',
    'KW 08 (23.02 - 01.03.2026)',
    'KW 09 (02.03 - 08.03.2026)',
    'KW 10 (09.03 - 15.03.2026)',
    'KW 11 (16.03 - 22.03.2026)',
    'KW 12 (23.03 - 29.03.2026)',
    'KW 13 (30.03 - 05.04.2026)',
    'KW 14 (06.04 - 12.04.2026)',
    'KW 15 (13.04 - 19.04.2026)',
    'KW 16 (20.04 - 26.04.2026)',
    'KW 17 (27.04 - 03.05.2026)',
    'KW 18 (04.05 - 10.05.2026)',
    'KW 19 (11.05 - 17.05.2026)',
    'KW 20 (18.05 - 24.05.2026)',
    'KW 21 (25.05 - 31.05.2026)',
    'KW 22 (01.06 - 07.06.2026)',
    'KW 23 (08.06 - 14.06.2026)',
    'KW 24 (15.06 - 21.06.2026)',
    'KW 25 (22.06 - 28.06.2026)',
    'KW 26 (29.06 - 05.07.2026)',
    'KW 27 (06.07 - 12.07.2026)',
    'KW 28 (13.07 - 19.07.2026)',
    'KW 29 (20.07 - 26.07.2026)',
    'KW 30 (27.07 - 02.08.2026)',
    'KW 31 (03.08 - 09.08.2026)',
    'KW 32 (10.08 - 16.08.2026)',
    'KW 33 (17.08 - 23.08.2026)',
    'KW 34 (24.08 - 30.08.2026)',
    'KW 35 (31.08 - 06.09.2026)',
    'KW 36 (07.09 - 13.09.2026)',
    'KW 37 (14.09 - 20.09.2026)',
    'KW 38 (21.09 - 27.09.2026)',
    'KW 39 (28.09 - 04.10.2026)',
    'KW 40 (05.10 - 11.10.2026)',
    'KW 41 (12.10 - 18.10.2026)',
    'KW 42 (19.10 - 25.10.2026)',
    'KW 43 (26.10 - 01.11.2026)',
    'KW 44 (02.11 - 08.11.2026)',
    'KW 45 (09.11 - 15.11.2026)',
    'KW 46 (16.11 - 22.11.2026)',
    'KW 47 (23.11 - 29.11.2026)',
    'KW 48 (30.11 - 06.12.2026)',
    'KW 49 (07.12 - 13.12.2026)',
    'KW 50 (14.12 - 20.12.2026)',
    'KW 51 (21.12 - 27.12.2026)',
    'KW 52 (28.12.2026 - 03.01.2027)',

    // 2027
    'KW 01 (04.01 - 10.01.2027)',
    'KW 02 (11.01 - 17.01.2027)',
    'KW 03 (18.01 - 24.01.2027)',
    'KW 04 (25.01 - 31.01.2027)',
    'KW 05 (01.02 - 07.02.2027)',
    'KW 06 (08.02 - 14.02.2027)',
    'KW 07 (15.02 - 21.02.2027)',
    'KW 08 (22.02 - 28.02.2027)',
    'KW 09 (01.03 - 07.03.2027)',
    'KW 10 (08.03 - 14.03.2027)',
    'KW 11 (15.03 - 21.03.2027)',
    'KW 12 (22.03 - 28.03.2027)',
    'KW 13 (29.03 - 04.04.2027)',
    'KW 14 (05.04 - 11.04.2027)',
    'KW 15 (12.04 - 18.04.2027)',
    'KW 16 (19.04 - 25.04.2027)',
    'KW 17 (26.04 - 02.05.2027)',
    'KW 18 (03.05 - 09.05.2027)',
    'KW 19 (10.05 - 16.05.2027)',
    'KW 20 (17.05 - 23.05.2027)',
    'KW 21 (24.05 - 30.05.2027)',
    'KW 22 (31.05 - 06.06.2027)',
    'KW 23 (07.06 - 13.06.2027)',
    'KW 24 (14.06 - 20.06.2027)',
    'KW 25 (21.06 - 27.06.2027)',
    'KW 26 (28.06 - 04.07.2027)',
    'KW 27 (05.07 - 11.07.2027)',
    'KW 28 (12.07 - 18.07.2027)',
    'KW 29 (19.07 - 25.07.2027)',
    'KW 30 (26.07 - 01.08.2027)',
    'KW 31 (02.08 - 08.08.2027)',
    'KW 32 (09.08 - 15.08.2027)',
    'KW 33 (16.08 - 22.08.2027)',
    'KW 34 (23.08 - 29.08.2027)',
    'KW 35 (30.08 - 05.09.2027)',
    'KW 36 (06.09 - 12.09.2027)',
    'KW 37 (13.09 - 19.09.2027)',
    'KW 38 (20.09 - 26.09.2027)',
    'KW 39 (27.09 - 03.10.2027)',
    'KW 40 (04.10 - 10.10.2027)',
    'KW 41 (11.10 - 17.10.2027)',
    'KW 42 (18.10 - 24.10.2027)',
    'KW 43 (25.10 - 31.10.2027)',
    'KW 44 (01.11 - 07.11.2027)',
    'KW 45 (08.11 - 14.11.2027)',
    'KW 46 (15.11 - 21.11.2027)',
    'KW 47 (22.11 - 28.11.2027)',
    'KW 48 (29.11 - 05.12.2027)',
    'KW 49 (06.12 - 12.12.2027)',
    'KW 50 (13.12 - 19.12.2027)',
    'KW 51 (20.12 - 26.12.2027)',
    'KW 52 (27.12.2027 - 02.01.2028)',

    // 2028
    'KW 01 (03.01 - 09.01.2028)',
    'KW 02 (10.01 - 16.01.2028)',
    'KW 03 (17.01 - 23.01.2028)',
    'KW 04 (24.01 - 30.01.2028)',
    'KW 05 (31.01 - 06.02.2028)',
    'KW 06 (07.02 - 13.02.2028)',
    'KW 07 (14.02 - 20.02.2028)',
    'KW 08 (21.02 - 27.02.2028)',
    'KW 09 (28.02 - 05.03.2028)',
    'KW 10 (06.03 - 12.03.2028)',
    'KW 11 (13.03 - 19.03.2028)',
    'KW 12 (20.03 - 26.03.2028)',
    'KW 13 (27.03 - 02.04.2028)',
    'KW 14 (03.04 - 09.04.2028)',
    'KW 15 (10.04 - 16.04.2028)',
    'KW 16 (17.04 - 23.04.2028)',
    'KW 17 (24.04 - 30.04.2028)',
    'KW 18 (01.05 - 07.05.2028)',
    'KW 19 (08.05 - 14.05.2028)',
    'KW 20 (15.05 - 21.05.2028)',
    'KW 21 (22.05 - 28.05.2028)',
    'KW 22 (29.05 - 04.06.2028)',
    'KW 23 (05.06 - 11.06.2028)',
    'KW 24 (12.06 - 18.06.2028)',
    'KW 25 (19.06 - 25.06.2028)',
    'KW 26 (26.06 - 02.07.2028)',
    'KW 27 (03.07 - 09.07.2028)',
    'KW 28 (10.07 - 16.07.2028)',
    'KW 29 (17.07 - 23.07.2028)',
    'KW 30 (24.07 - 30.07.2028)',
    'KW 31 (31.07 - 06.08.2028)',
    'KW 32 (07.08 - 13.08.2028)',
    'KW 33 (14.08 - 20.08.2028)',
    'KW 34 (21.08 - 27.08.2028)',
    'KW 35 (28.08 - 03.09.2028)',
    'KW 36 (04.09 - 10.09.2028)',
    'KW 37 (11.09 - 17.09.2028)',
    'KW 38 (18.09 - 24.09.2028)',
    'KW 39 (25.09 - 01.10.2028)',
    'KW 40 (02.10 - 08.10.2028)',
    'KW 41 (09.10 - 15.10.2028)',
    'KW 42 (16.10 - 22.10.2028)',
    'KW 43 (23.10 - 29.10.2028)',
    'KW 44 (30.10 - 05.11.2028)',
    'KW 45 (06.11 - 12.11.2028)',
    'KW 46 (13.11 - 19.11.2028)',
    'KW 47 (20.11 - 26.11.2028)',
    'KW 48 (27.11 - 03.12.2028)',
    'KW 49 (04.12 - 10.12.2028)',
    'KW 50 (11.12 - 17.12.2028)',
    'KW 51 (18.12 - 24.12.2028)',
    'KW 52 (25.12 - 31.12.2028)'
  ]);

  // Finde die aktuelle Woche
  const getCurrentWeekFromList = useCallback(() => {
    const currentWeekStr = getCurrentWeek();
    console.log('Aktuelle Woche (String):', currentWeekStr);
    
    const foundWeek = weeks.find(week => week === currentWeekStr);
    console.log('Gefundene Woche:', foundWeek);
    
    if (!foundWeek) {
      console.warn('Aktuelle Woche nicht in der Liste gefunden, verwende erste Woche:', weeks[0]);
    }
    
    return foundWeek || weeks[0];
  }, [weeks]);

  // Initialisiere selectedWeek mit der aktuellen Woche
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const initialWeek = getCurrentWeekFromList();
    console.log('Initiale Woche:', initialWeek);
    return initialWeek;
  });

  // Aktualisiere selectedWeek jede Minute
  useEffect(() => {
    console.log('Setting up interval for week updates');
    const interval = setInterval(() => {
      const currentWeek = getCurrentWeekFromList();
      if (currentWeek !== selectedWeek) {
        console.log('Aktualisiere Woche von', selectedWeek, 'zu', currentWeek);
        setSelectedWeek(currentWeek);
      }
    }, 60000); // Überprüfe jede Minute

    return () => {
      console.log('Cleaning up interval');
      clearInterval(interval);
    };
  }, [getCurrentWeekFromList]); // Entferne selectedWeek aus den Abhängigkeiten

  // Debug-Ausgaben
  useEffect(() => {
    console.log('Weeks array:', weeks);
    console.log('Selected week:', selectedWeek);
  }, [weeks, selectedWeek]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [modalData, setModalData] = useState({ day: '', time: '' });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [selectedChild, setSelectedChild] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [documentationSaved, setDocumentationSaved] = useState(false);
  const [showDocumentations, setShowDocumentations] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editingDocText, setEditingDocText] = useState('');

  // Speichere scheduleData in localStorage bei Änderungen
  useEffect(() => {
    if (scheduleData && Object.keys(scheduleData).length > 0) {
      try {
        localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
        console.log('Saved updated scheduleData to localStorage');
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [scheduleData]);

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

  // Aktualisiere die useEffect-Hook für das Laden der aktuellen Schicht
  useEffect(() => {
    if (modalOpen && modalData.day && modalData.time && selectedShiftId) {
      console.log('Modal opened, loading shift data...', {
        selectedWeek,
        modalData,
        selectedShiftId
      }); // Debug-Log
      
      // Hole die aktuelle Version der Schicht aus scheduleData
      const currentShiftData = scheduleData[selectedWeek]?.[modalData.day]?.[modalData.time]?.find(
        s => s.id === selectedShiftId
      );
      
      console.log('Found shift data in scheduleData:', currentShiftData); // Debug-Log
      console.log('Full scheduleData for this time slot:', 
        JSON.stringify(scheduleData[selectedWeek]?.[modalData.day]?.[modalData.time], null, 2)
      ); // Debug-Log
      
      if (currentShiftData) {
        // Stelle sicher, dass documentations als Array initialisiert ist
        const shiftWithDocs = {
          ...currentShiftData,
          documentations: Array.isArray(currentShiftData.documentations) 
            ? [...currentShiftData.documentations] 
            : []
        };
        console.log('Setting currentShift with documentations:', shiftWithDocs); // Debug-Log
        setCurrentShift(shiftWithDocs);
      } else {
        console.warn('No shift data found for:', {
          selectedWeek,
          day: modalData.day,
          time: modalData.time,
          shiftId: selectedShiftId
        });
      }
    }
  }, [modalOpen, selectedWeek, modalData.day, modalData.time, scheduleData, selectedShiftId]);

  // Füge einen Effect hinzu, der auf Änderungen des scheduleData reagiert
  useEffect(() => {
    if (modalOpen && currentShift && modalData.day && modalData.time) {
      const currentShiftInData = scheduleData[selectedWeek]?.[modalData.day]?.[modalData.time]?.find(
        s => s.id === currentShift.id
      );
      
      if (currentShiftInData && JSON.stringify(currentShiftInData) !== JSON.stringify(currentShift)) {
        console.log('Updating currentShift from scheduleData:', currentShiftInData);
        setCurrentShift(currentShiftInData);
        
        // Zeige Dokumentationen an, wenn welche vorhanden sind
        if (Array.isArray(currentShiftInData.documentations) && currentShiftInData.documentations.length > 0) {
          setShowDocumentations(true);
        }
      }
    }
  }, [scheduleData, modalOpen, currentShift, modalData.day, modalData.time, selectedWeek]);

  const handleShiftClick = useCallback((shift, day, time) => {
    console.log('handleShiftClick Parameter:', { shift, day, time, selectedWeek });
    console.log('DAYS_OF_WEEK:', days);
    console.log('Tag der Schicht:', day);
    console.log('Index des Tages:', days.indexOf(day));
    
    setSelectedShiftId(shift.id);
    
    // Extrahiere das Startdatum aus der selectedWeek
    const weekMatch = selectedWeek.match(/\((\d{2}\.\d{2})\s*-/);
    if (weekMatch) {
      const [startDay, startMonth] = weekMatch[1].split('.');
      const year = selectedWeek.match(/\.(\d{4})\)/)[1];
      const dayIndex = days.indexOf(day);
      
      console.log('Datums-Berechnung:', {
        startDay,
        startMonth,
        year,
        dayIndex,
        selectedWeek
      });
      
      // Erstelle das Datum für den ersten Tag der Woche
      const mondayDate = new Date(parseInt(year), parseInt(startMonth) - 1, parseInt(startDay));
      const targetDate = new Date(mondayDate);
      targetDate.setDate(mondayDate.getDate() + dayIndex);
      
      console.log('Berechnetes Datum:', targetDate.toISOString());
      
      const formattedDate = targetDate.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      console.log('Formatiertes Datum:', formattedDate);
      
      setModalData({ 
        day,
        time,
        formattedDate
      });
    }
    
    setShowDocumentations(false);
    
    const isUserShift = currentUser && (
      (shift.isCustom && shift.customEmployeeIds?.includes(currentUser.id)) ||
      (!shift.isCustom && shift.employeeId === currentUser.id)
    );
    
    if (isEditable || isUserShift) {
      try {
        // Hole die aktuelle Version der Schicht aus scheduleData
        let currentShiftData = null;
        let correctTime = time;
        
        // Suche in allen Zeitslots des Tages
        if (scheduleData[selectedWeek]?.[day]) {
          Object.keys(scheduleData[selectedWeek][day]).forEach(timeSlot => {
            const foundShift = scheduleData[selectedWeek][day][timeSlot]?.find(s => s.id === shift.id);
            if (foundShift) {
              currentShiftData = foundShift;
              correctTime = timeSlot;
              console.log('Gefundene Schicht:', { 
                day, 
                timeSlot, 
                shiftId: shift.id
              });
            }
          });
        }
        
        if (currentShiftData) {
          const shiftWithDocs = {
            ...currentShiftData,
            documentations: Array.isArray(currentShiftData.documentations) 
              ? [...currentShiftData.documentations] 
              : []
          };
          
          setCurrentShift(shiftWithDocs);
          setModalData(prev => ({ 
            ...prev, 
            time: correctTime
          }));
        } else {
          console.warn('Schicht nicht gefunden:', { day, time, shiftId: shift.id });
          const newShift = {
            ...shift,
            documentations: []
          };
          setCurrentShift(newShift);
        }
        
        setModalOpen(true);
      } catch (error) {
        console.error('Error in handleShiftClick:', error);
        alert('Beim Laden der Schichtdaten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
      }
    }
  }, [isEditable, currentUser, scheduleData, selectedWeek, days]);

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
  const getCurrentDateString = useMemo(() => {
    const calculateDate = (day, index) => {
      const dateString = getDateFromWeek(selectedWeek, selectedDay ? days.indexOf(selectedDay) : index);
      const isToday = isCurrentDay(dateString);
      return { dateString, isToday };
    };
    return calculateDate;
  }, [selectedWeek, selectedDay, days]);

  // Hilfsfunktion zum Formatieren des Datums
  const formatWeekDayDate = (weekString, day) => {
    console.log('formatWeekDayDate Input:', { weekString, day });
    
    // Extrahiere das Startdatum aus dem weekString
    const dateMatch = weekString.match(/\((\d{2}\.\d{2})\s*-/);
    if (!dateMatch) {
      console.error('Konnte Startdatum nicht aus weekString extrahieren:', weekString);
      return '';
    }
    
    const [startDay, startMonth] = dateMatch[1].split('.');
    const year = weekString.match(/\.(\d{4})\)/)[1];
    
    // Finde den Index des Tages (0 = Montag, 6 = Sonntag)
    const dayIndex = days.indexOf(day);
    console.log('Tag und Index:', { day, dayIndex, days });
    
    if (dayIndex === -1) {
      console.error('Ungültiger Tag:', day);
      return '';
    }
    
    // Erstelle das Datum für den ersten Tag der Woche
    const date = new Date(parseInt(year), parseInt(startMonth) - 1, parseInt(startDay));
    console.log('Startdatum der Woche:', date.toISOString());
    
    // Addiere die Tage entsprechend dem Index
    const targetDate = new Date(date);
    targetDate.setDate(date.getDate() + dayIndex);
    console.log('Berechnetes Datum:', targetDate.toISOString());
    
    // Formatiere das Datum
    const formattedDate = targetDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    console.log('Formatiertes Datum:', formattedDate);
    return formattedDate;
  };

  // Hilfsfunktion zum Ermitteln der Start- und Endzeit
  const getShiftTimes = (shift, time) => {
    if (shift?.isCustom) {
      return `${shift.customStartTime} - ${shift.customEndTime}`;
    }

    const shiftType = shiftTypes.find(t => t.id === shift?.shiftTypeId);
    if (shiftType) {
      return `${shiftType.startTime} - ${shiftType.endTime}`;
    }

    // Fallback: Wenn keine spezifischen Zeiten gefunden wurden
    const timeIndex = timeSlots.indexOf(time);
    if (timeIndex >= 0 && timeIndex < timeSlots.length - 1) {
      return `${time} - ${timeSlots[timeIndex + 1]}`;
    }

    return time;
  };

  // Schicht-Funktionen
  const handleSaveShift = (shiftData) => {
    try {
      const newShift = handleShiftSaveUtil({
        shiftData,
        currentShift,
        scheduleData,
        selectedWeek,
        modalData,
        shiftTypes,
        employees
      });

      const updatedScheduleData = updateScheduleWithNewShift(
        scheduleData,
        selectedWeek,
        shiftData.date,
        shiftData.time,
        newShift,
        currentShift
      );

      setScheduleData(updatedScheduleData);
      setModalOpen(false);
      setCurrentShift(null);
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleDeleteShift = (day, time, shiftId) => {
    const updatedScheduleData = deleteShiftFromSchedule(scheduleData, selectedWeek, day, shiftId);
    setScheduleData(updatedScheduleData);
  };
  
  // Hilfsfunktion zum Generieren des Wochenstrings
  const getWeekString = (weekNumber, year) => {
    // Berechne das Datum für den ersten Tag der Woche (Montag)
    const firstDayOfWeek = getFirstDayOfWeek(weekNumber, year);
    
    // Berechne das Datum für den letzten Tag der Woche (Sonntag)
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    
    // Formatiere die Daten
    const firstDayFormatted = formatDate(firstDayOfWeek, DATE_FORMATS.SHORT_DATE);
    const lastDayFormatted = formatDate(lastDayOfWeek, DATE_FORMATS.SHORT_DATE_WITH_YEAR);
    
    return `KW ${weekNumber.toString().padStart(2, '0')} (${firstDayFormatted} - ${lastDayFormatted})`;
  };

  // Hilfsfunktion zum Berechnen des ersten Tags einer Kalenderwoche
  const getFirstDayOfWeek = (weekNumber, year) => {
    // Erstelle ein Datum für den 4. Januar des Jahres (dieser Tag liegt immer in KW 1)
    const jan4 = new Date(year, 0, 4);
    
    // Finde den Montag dieser Woche
    const firstMondayOfYear = new Date(jan4);
    firstMondayOfYear.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1);
    
    // Berechne den Montag der gewünschten Woche
    const targetMonday = new Date(firstMondayOfYear);
    targetMonday.setDate(firstMondayOfYear.getDate() + (weekNumber - 1) * 7);
    
    return targetMonday;
  };

  const goToPreviousWeek = () => {
    const currentIndex = weeks.indexOf(selectedWeek);
    if (currentIndex > 0) setSelectedWeek(weeks[currentIndex - 1]);
  };

  const goToNextWeek = () => {
    const currentIndex = weeks.indexOf(selectedWeek);
    if (currentIndex < weeks.length - 1) setSelectedWeek(weeks[currentIndex + 1]);
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
    exportScheduleAsPDF({
      selectedDay,
      selectedWeek,
      days,
      timeSlots,
      scheduleData,
      formatWeekDayDate
    });
  };

  const handleSaveDocumentation = () => {
    if (!selectedChild || !documentation.trim()) return;

    try {
      const { updatedScheduleData, updatedShift } = addDocumentationToShift({
        selectedChild,
        documentation,
        currentUser,
        currentShift,
        scheduleData,
        selectedWeek,
        modalData
      });

      setScheduleData(updatedScheduleData);
      setCurrentShift(updatedShift);
      setShowDocumentations(true);
      setDocumentationSaved(true);
      setSelectedChild('');
      setDocumentation('');

      setTimeout(() => {
        setDocumentationSaved(false);
      }, 2000);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditDocumentation = (docId) => {
    const doc = currentShift.documentations.find(d => d.id === docId);
    if (doc) {
      setEditingDocId(docId);
      setEditingDocText(doc.text);
      setSelectedChild(doc.childId.toString());
    }
  };

  const handleUpdateDocumentation = () => {
    if (!editingDocText.trim() || !selectedChild) return;

    try {
      const { updatedScheduleData, updatedShift } = updateDocumentationInShift({
        editingDocId,
        editingDocText,
        selectedChild,
        currentShift,
        scheduleData,
        selectedWeek,
        modalData
      });

      setScheduleData(updatedScheduleData);
      setCurrentShift(updatedShift);
      setDocumentationSaved(true);
      setEditingDocId(null);
      setEditingDocText('');
      setSelectedChild('');
      
      setTimeout(() => {
        setDocumentationSaved(false);
      }, 2000);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteDocumentation = (docId) => {
    if (window.confirm('Möchten Sie diese Dokumentation wirklich löschen?')) {
      try {
        const { updatedScheduleData, updatedShift } = deleteDocumentationFromShift({
          docId,
          currentShift,
          scheduleData,
          selectedWeek,
          modalData
        });

        setScheduleData(updatedScheduleData);
        setCurrentShift(updatedShift);
        setDocumentationSaved(true);
        
        setTimeout(() => {
          setDocumentationSaved(false);
        }, 2000);
      } catch (error) {
        alert(error.message);
      }
    }
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
              {employees
                .filter(employee => employee.role !== 'admin')
                .map(employee => (
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
              disabled={weeks.indexOf(selectedWeek) === weeks.length - 1}
            >◀</button>
            <select
              className="filter-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {[...weeks].reverse().map((week) => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
            <button
              className="week-nav-button"
              onClick={goToNextWeek}
              disabled={weeks.indexOf(selectedWeek) === 0}
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
            setSelectedShiftId(null);
            setSelectedChild('');
            setDocumentation('');
            setDocumentationSaved(false);
            setShowDocumentations(false);
            setEditingDocId(null);
            setEditingDocText('');
            setModalOpen(false);
          }}
          title="Schichtdetails"
        >
          <div className="modal-content">
            <div className="shift-details">
              <div className="detail-item">
                <strong>Schichttyp</strong>
                <span>{currentShift?.isCustom ? currentShift.customTitle : shiftTypes.find(t => t.id === currentShift?.shiftTypeId)?.name}</span>
              </div>
              <div className="detail-item">
                <strong>Datum</strong>
                <span>{modalData.formattedDate}</span>
              </div>
              <div className="detail-item">
                <strong>Uhrzeit</strong>
                <span>{getShiftTimes(currentShift, modalData.time)}</span>
              </div>
              {currentShift?.tasks?.length > 0 && (
                <div className="detail-item">
                  <strong>Aufgaben</strong>
                  <span>{currentShift.tasks.join(', ')}</span>
                </div>
              )}
              {currentShift?.notes && (
                <div className="detail-item">
                  <strong>Notizen</strong>
                  <span>{currentShift.notes}</span>
                </div>
              )}
            </div>

            {currentUser && (currentShift?.employeeId === currentUser.id || currentShift?.customEmployeeIds?.includes(currentUser.id)) && (
              <div className="documentation-section">
                <h4>Dokumentation</h4>
                
                <button 
                  className={`documentation-toggle-button ${showDocumentations ? 'open' : ''}`}
                  onClick={() => setShowDocumentations(!showDocumentations)}
                >
                  Dokumentationen {currentShift?.documentations?.length > 0 ? `(${currentShift.documentations.length})` : ''}
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M2 4L6 8L10 4" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showDocumentations && (
                  <>
                    {currentShift?.documentations && currentShift.documentations.length > 0 && (
                      <div className="documentation-list">
                        {currentShift.documentations.map(doc => {
                          const child = children.find(c => c.id === doc.childId);
                          const employee = employees.find(e => e.id === doc.employeeId);
                          const isEditing = doc.id === editingDocId;
                          
                          return (
                            <div key={doc.id} className="documentation-entry">
                              {isEditing ? (
                                <>
                                  <div className="form-group">
                                    <label className="form-label">Kind auswählen</label>
                                    <select
                                      className="form-select"
                                      value={selectedChild}
                                      onChange={(e) => setSelectedChild(e.target.value)}
                                    >
                                      <option value="">Bitte wählen...</option>
                                      {children.map((child) => (
                                        <option key={child.id} value={child.id}>
                                          {child.name} ({child.group})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="form-group">
                                    <label className="form-label">Dokumentation bearbeiten</label>
                                    <textarea
                                      className="form-textarea"
                                      value={editingDocText}
                                      onChange={(e) => setEditingDocText(e.target.value)}
                                      rows={4}
                                      maxLength={1000}
                                    />
                                  </div>

                                  <div className="documentation-actions">
                                    <button
                                      className="button primary"
                                      onClick={handleUpdateDocumentation}
                                      disabled={!editingDocText.trim() || !selectedChild}
                                    >
                                      Speichern
                                    </button>
                                    <button
                                      className="button secondary"
                                      onClick={() => {
                                        setEditingDocId(null);
                                        setEditingDocText('');
                                        setSelectedChild('');
                                      }}
                                    >
                                      Abbrechen
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="documentation-header">
                                    <p>
                                      <strong>{child?.name || 'Gelöschtes Kind'}</strong>
                                      <span className="documentation-date">
                                        {new Date(doc.timestamp).toLocaleString('de-DE', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </p>
                                    {doc.employeeId === currentUser.id && (
                                      <div className="documentation-actions">
                                        <button
                                          className="icon-button edit"
                                          onClick={() => handleEditDocumentation(doc.id)}
                                          title="Dokumentation bearbeiten"
                                        >
                                          ✎
                                        </button>
                                        <button
                                          className="icon-button delete"
                                          onClick={() => handleDeleteDocumentation(doc.id)}
                                          title="Dokumentation löschen"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <p className="documentation-text">{doc.text}</p>
                                  <p className="documentation-author">Dokumentiert von: {employee?.name}</p>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="form-group mt-4">
                      <label className="form-label">Kind auswählen</label>
                      <select
                        className="form-select"
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                      >
                        <option value="">Bitte wählen...</option>
                        {children.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.name} ({child.group})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dokumentation</label>
                      <div className="documentation-input-container">
                        <textarea
                          className="form-textarea"
                          value={documentation}
                          onChange={(e) => setDocumentation(e.target.value)}
                          placeholder="Dokumentation eingeben..."
                          rows={4}
                          maxLength={1000}
                        />
                        <div className="character-counter">
                          {documentation.length}/1000 Zeichen
                        </div>
                      </div>
                    </div>

                    <button
                      className="button primary"
                      onClick={handleSaveDocumentation}
                      disabled={!selectedChild || !documentation.trim()}
                    >
                      Dokumentation speichern
                    </button>

                    {documentationSaved && (
                      <div className="success-message">
                        ✓ Dokumentation wurde erfolgreich gespeichert!
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="button secondary" onClick={() => {
                setSelectedShiftId(null);
                setSelectedChild('');
                setDocumentation('');
                setDocumentationSaved(false);
                setShowDocumentations(false);
                setEditingDocId(null);
                setEditingDocText('');
                setModalOpen(false);
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