import React, { useState } from 'react';
import Modal from '../common/Modal';

function ShiftView({ shiftTypes, setShiftTypes }) {
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '07:00',
    endTime: '14:00',
    color: 'blue'
  });

  const colors = [
    { value: 'blue', label: 'Blau' },
    { value: 'green', label: 'Grün' },
    { value: 'purple', label: 'Lila' },
    { value: 'gray', label: 'Grau' },
    { value: 'red', label: 'Rot' },
    { value: 'yellow', label: 'Gelb' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingShift) {
      // Bearbeite existierenden Schichttyp
      setShiftTypes(prev => prev.map(shift => 
        shift.id === editingShift.id 
          ? { ...shift, ...formData }
          : shift
      ));
    } else {
      // Füge neuen Schichttyp hinzu
      setShiftTypes(prev => [...prev, {
        id: Date.now(),
        ...formData
      }]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (shiftId) => {
    if (!window.confirm('Möchten Sie diesen Schichttyp wirklich löschen?')) return;
    setShiftTypes(prev => prev.filter(shift => shift.id !== shiftId));
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      color: shift.color
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShift(null);
    setFormData({
      name: '',
      startTime: '07:00',
      endTime: '14:00',
      color: 'blue'
    });
  };

  return (
    <div>
      <div className="view-header">
        <h3>Schichttypen verwalten</h3>
        <button className="button" onClick={() => setShowModal(true)}>
          Schichttyp hinzufügen
        </button>
      </div>

      <div className="shift-list">
        {shiftTypes.map(shift => (
          <div key={shift.id} className="shift-card">
            <div className="shift-info">
              <div className="shift-name">{shift.name}</div>
              <div className="shift-time">
                {shift.startTime} - {shift.endTime}
              </div>
              <div className={`color-indicator ${shift.color}`}>
                {colors.find(c => c.value === shift.color)?.label}
              </div>
            </div>
            <div className="shift-actions">
              <button 
                className="button secondary"
                onClick={() => handleEdit(shift)}
              >
                Bearbeiten
              </button>
              <button 
                className="button secondary"
                onClick={() => handleDelete(shift.id)}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingShift ? "Schichttyp bearbeiten" : "Neuer Schichttyp"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Startzeit</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Endzeit</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Farbe</label>
            <select
              value={formData.color}
              onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="form-select"
            >
              {colors.map(color => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="button secondary" onClick={handleCloseModal}>
              Abbrechen
            </button>
            <button type="submit" className="button">
              {editingShift ? "Speichern" : "Hinzufügen"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ShiftView; 