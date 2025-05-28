import React, { useState, useEffect } from 'react';

function ShiftForm({ onSave, onCancel, shift = null }) {
  const [formData, setFormData] = useState({
    name: '',
    startTime: '07:00',
    endTime: '14:00',
    color: 'blue',
  });

  // Wenn eine Schicht zum Bearbeiten übergeben wurde, lade ihre Daten
  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || '',
        startTime: shift.startTime || '07:00',
        endTime: shift.endTime || '14:00',
        color: shift.color || 'blue',
      });
    }
  }, [shift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: shift?.id || Date.now(),
      ...formData
    });
  };

  const colors = [
    { value: 'blue', label: 'Blau' },
    { value: 'green', label: 'Grün' },
    { value: 'purple', label: 'Lila' },
    { value: 'red', label: 'Rot' },
    { value: 'yellow', label: 'Gelb' },
    { value: 'gray', label: 'Grau' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="name">Name der Schicht</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-input-full"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="startTime">Startzeit</label>
        <input
          type="time"
          id="startTime"
          name="startTime"
          className="form-input"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="endTime">Endzeit</label>
        <input
          type="time"
          id="endTime"
          name="endTime"
          className="form-input"
          value={formData.endTime}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="color">Farbe</label>
        <select
          id="color"
          name="color"
          className="form-select"
          value={formData.color}
          onChange={handleChange}
        >
          {colors.map(color => (
            <option key={color.value} value={color.value}>{color.label}</option>
          ))}
        </select>
      </div>
      
      <div className="modal-footer">
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="button">
          {shift ? 'Aktualisieren' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  );
}

export default ShiftForm;