import React, { useState } from 'react';
import Modal from './common/Modal';
import ShiftForm from './shifts/ShiftForm';

function ShiftView({ shiftTypes, setShiftTypes }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  
  // Öffnet das Modal zum Hinzufügen einer Schicht
  const handleAddShift = () => {
    setCurrentShift(null);
    setModalOpen(true);
  };
  
  // Öffnet das Modal zum Bearbeiten einer Schicht
  const handleEditShift = (shift) => {
    setCurrentShift(shift);
    setModalOpen(true);
  };
  
  // Speichert eine neue oder bearbeitete Schicht
  const handleSaveShift = (shiftData) => {
    if (currentShift) {
      // Bestehende Schicht aktualisieren
      setShiftTypes(prev => 
        prev.map(shift => shift.id === shiftData.id ? shiftData : shift)
      );
    } else {
      // Neue Schicht hinzufügen
      setShiftTypes(prev => [...prev, shiftData]);
    }
    setModalOpen(false);
  };
  
  // Löscht eine Schicht
  const handleDeleteShift = (id) => {
    if (!window.confirm('Möchtest du diese Schicht wirklich löschen?')) return;
    setShiftTypes(prev => prev.filter(shift => shift.id !== id));
  };
  
  // Berechnet die Dauer einer Schicht in Stunden
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2023-01-01T${startTime}:00`);
    const end = new Date(`2023-01-01T${endTime}:00`);
    if (end < start) end.setDate(end.getDate() + 1); // Behandelt Übernachtschichten
    const diff = (end - start) / 1000 / 60 / 60;
    return `${diff} Stunden`;
  };
  
  return (
    <div className="shift-view">
      <div className="flex justify-between items-center mb-4">
        <h3>Schichttypen</h3>
        <button className="button" onClick={handleAddShift}>
          Schicht hinzufügen
        </button>
      </div>
      
      <div className="shift-list">
        {shiftTypes.map(shift => (
          <div key={shift.id} className="shift-card">
            <div className="shift-info">
              <div className="shift-name">{shift.name}</div>
              <div className="shift-time">
                {shift.startTime} - {shift.endTime} ({calculateDuration(shift.startTime, shift.endTime)})
              </div>
            </div>
            <div className="shift-color" style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '12px', 
              backgroundColor: shift.color,
              marginRight: '12px'
            }} />
            <div className="shift-actions">
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
      </div>
      
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={currentShift ? "Schicht bearbeiten" : "Neue Schicht"}
      >
        <ShiftForm 
          shift={currentShift}
          onSave={handleSaveShift}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default ShiftView;