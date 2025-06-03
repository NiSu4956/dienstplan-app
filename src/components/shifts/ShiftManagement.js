import React, { useState } from 'react';
import Modal from '../common/Modal';
import ShiftForm from './ShiftForm';

function ShiftManagement({ shiftTypes, setShiftTypes, employees }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddShift = () => {
    setCurrentShift(null);
    setModalOpen(true);
  };

  const handleEditShift = (shift) => {
    setCurrentShift(shift);
    setModalOpen(true);
  };

  const handleDeleteShift = (id) => {
    if (window.confirm('Möchten Sie diesen Schichttyp wirklich löschen?')) {
      setShiftTypes(prev => prev.filter(shift => shift.id !== id));
    }
  };

  const handleSaveShift = (shiftData) => {
    if (currentShift) {
      // Bestehende Schicht aktualisieren
      setShiftTypes(prev => 
        prev.map(shift => shift.id === currentShift.id ? { ...shift, ...shiftData } : shift)
      );
    } else {
      // Neue Schicht hinzufügen
      setShiftTypes(prev => [...prev, { ...shiftData, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  const filteredShifts = shiftTypes.filter(shift =>
    shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (shift.requiredQualifications && shift.requiredQualifications.some(q => 
      q.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div className="employee-view">
      <div className="flex justify-between items-center mb-4">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Schichttypen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="button" onClick={handleAddShift}>
          Schichttyp hinzufügen
        </button>
      </div>

      <div className="employee-list">
        {filteredShifts.map((shift) => (
          <div key={shift.id} className="employee-card">
            <div className="employee-info">
              <div className="employee-name">{shift.name}</div>
              <div className="employee-role">
                Zeitraum: {shift.startTime} - {shift.endTime}
              </div>
              <div className="employee-qualifications">
                <span className={`qualification-tag bg-${shift.color}-100 text-${shift.color}-800 border-${shift.color}-300`}>
                  {(() => {
                    const start = new Date(`2023-01-01T${shift.startTime}:00`);
                    const end = new Date(`2023-01-01T${shift.endTime}:00`);
                    if (end < start) end.setDate(end.getDate() + 1); // Handle overnight shifts
                    const diff = (end - start) / 1000 / 60 / 60;
                    return `${diff} Stunden`;
                  })()}
                </span>
                {shift.requiredQualifications && shift.requiredQualifications.map((qual) => (
                  <span key={qual} className="qualification-tag">
                    {qual}
                  </span>
                ))}
              </div>
            </div>
            <div className="employee-actions">
              <button
                className="button"
                onClick={() => handleEditShift(shift)}
              >
                Bearbeiten
              </button>
              <button
                className="button secondary"
                onClick={() => handleDeleteShift(shift.id)}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
        {filteredShifts.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Keine Schichttypen gefunden
          </div>
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={currentShift ? "Schichttyp bearbeiten" : "Neuer Schichttyp"}
      >
        <ShiftForm 
          shift={currentShift}
          onSave={handleSaveShift}
          onCancel={() => setModalOpen(false)}
          employees={employees}
        />
      </Modal>
    </div>
  );
}

export default ShiftManagement;