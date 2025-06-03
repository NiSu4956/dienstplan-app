import React, { useState, useMemo } from 'react';

const colors = [
  { value: 'blue', label: 'Blau' },
  { value: 'green', label: 'Grün' },
  { value: 'purple', label: 'Lila' },
  { value: 'gray', label: 'Grau' },
  { value: 'red', label: 'Rot' },
  { value: 'yellow', label: 'Gelb' }
];

function ShiftForm({ shift, onSave, onCancel, employees }) {
  const availableQualifications = useMemo(() => {
    // Sammle alle einzigartigen Qualifikationen aus den Mitarbeiterdaten
    const qualSet = new Set();
    employees.forEach(employee => {
      employee.qualifications.forEach(qual => qualSet.add(qual));
    });
    return Array.from(qualSet).sort();
  }, [employees]);

  const [formData, setFormData] = useState({
    name: shift?.name || '',
    startTime: shift?.startTime || '07:00',
    endTime: shift?.endTime || '14:00',
    color: shift?.color?.replace('bg-', '').replace('-100', '') || 'blue',
    requiredQualifications: shift?.requiredQualifications || [],
    tasks: shift?.tasks || []
  });

  const [newTask, setNewTask] = useState('');

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

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask.trim()]
    }));
    setNewTask('');
  };

  const handleRemoveTask = (taskToRemove) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task !== taskToRemove)
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
        <div className="qualification-input-group">
          <select
            className="form-select"
            value=""
            onChange={(e) => handleQualificationToggle(e.target.value)}
          >
            <option value="">Qualifikation auswählen...</option>
            {availableQualifications
              .filter(qual => !formData.requiredQualifications.includes(qual))
              .map((qualification) => (
                <option key={qualification} value={qualification}>
                  {qualification}
                </option>
              ))}
          </select>
        </div>
        <div className="qualification-list">
          {formData.requiredQualifications.map((qualification) => (
            <div key={qualification} className="qualification-item">
              <span className="qualification-name">{qualification}</span>
              <button
                type="button"
                className="button-icon"
                onClick={() => handleQualificationToggle(qualification)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Aufgaben</label>
        <div className="task-list">
          {formData.tasks.map((task, index) => (
            <div key={index} className="task-item">
              <span className="task-text">{task}</span>
              <button
                type="button"
                className="button-icon"
                onClick={() => handleRemoveTask(task)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="task-input-group">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="form-input"
            placeholder="Neue Aufgabe eingeben..."
          />
          <button
            type="button"
            className="button"
            onClick={handleAddTask}
          >
            +
          </button>
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