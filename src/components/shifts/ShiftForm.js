import React, { useState } from 'react';

const colors = [
  { value: 'blue', label: 'Blau' },
  { value: 'green', label: 'Grün' },
  { value: 'purple', label: 'Lila' },
  { value: 'gray', label: 'Grau' },
  { value: 'red', label: 'Rot' },
  { value: 'yellow', label: 'Gelb' }
];

const availableQualifications = [
  'WG1',
  'WG2',
  'Nachtdienst',
  'Kochen',
  'Schule',
  'Freizeitaktivitäten',
  'Management',
  'Notfall'
];

function ShiftForm({ shift, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: shift?.name || '',
    startTime: shift?.startTime || '07:00',
    endTime: shift?.endTime || '14:00',
    color: shift?.color?.replace('bg-', '').replace('-100', '') || 'blue',
    requiredQualifications: shift?.requiredQualifications || []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQualificationToggle = (qualification) => {
    setFormData(prev => ({
      ...prev,
      requiredQualifications: prev.requiredQualifications.includes(qualification)
        ? prev.requiredQualifications.filter(q => q !== qualification)
        : [...prev.requiredQualifications, qualification]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Startzeit</label>
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Endzeit</label>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Farbe</label>
        <select
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="form-select"
          required
        >
          {colors.map(color => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Erforderliche Qualifikationen</label>
        <div className="qualification-selection">
          {availableQualifications.map((qualification) => (
            <label key={qualification} className="qualification-checkbox">
              <input
                type="checkbox"
                checked={formData.requiredQualifications.includes(qualification)}
                onChange={() => handleQualificationToggle(qualification)}
              />
              <span className="qualification-name">{qualification}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="button">
          {shift ? "Speichern" : "Hinzufügen"}
        </button>
      </div>
    </form>
  );
}

export default ShiftForm;