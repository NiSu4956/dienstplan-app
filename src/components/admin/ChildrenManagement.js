import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

function ChildrenManagement() {
  const [children, setChildren] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Beispieldaten - später durch echte Datenbank ersetzen
  useEffect(() => {
    setChildren([
      { id: 1, name: 'Max Mustermann', birthDate: '2015-06-15', group: 'WG1', notes: 'Allergisch gegen Nüsse' },
      { id: 2, name: 'Anna Schmidt', birthDate: '2016-03-22', group: 'WG2', notes: 'Schwimmen am Dienstag' },
    ]);
  }, []);

  const handleAddChild = () => {
    setCurrentChild(null);
    setModalOpen(true);
  };

  const handleEditChild = (child) => {
    setCurrentChild(child);
    setModalOpen(true);
  };

  const handleDeleteChild = (childId) => {
    if (window.confirm('Möchten Sie dieses Kind wirklich löschen?')) {
      setChildren(prev => prev.filter(child => child.id !== childId));
    }
  };

  const handleSaveChild = (childData) => {
    if (currentChild) {
      // Bearbeiten eines existierenden Kindes
      setChildren(prev => prev.map(child => 
        child.id === currentChild.id ? { ...child, ...childData } : child
      ));
    } else {
      // Neues Kind hinzufügen
      setChildren(prev => [...prev, { ...childData, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employee-view">
      <div className="flex justify-between items-center mb-4">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Kinder suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="button" onClick={handleAddChild}>
          Kind hinzufügen
        </button>
      </div>

      <div className="employee-list">
        {filteredChildren.map((child) => (
          <div key={child.id} className="employee-card">
            <div className="employee-info">
              <div className="employee-name">{child.name}</div>
              <div className="employee-role">
                Geburtsdatum: {new Date(child.birthDate).toLocaleDateString('de-DE')}
              </div>
              <div className="employee-qualifications">
                <span className="qualification-tag">
                  {child.group}
                </span>
              </div>
              {child.notes && (
                <div className="employee-role">{child.notes}</div>
              )}
            </div>
            <div className="employee-actions">
              <button
                className="button"
                onClick={() => handleEditChild(child)}
              >
                Bearbeiten
              </button>
              <button
                className="button secondary"
                onClick={() => handleDeleteChild(child.id)}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
        {filteredChildren.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Keine Kinder gefunden
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentChild ? "Kind bearbeiten" : "Kind hinzufügen"}
      >
        <ChildForm
          child={currentChild}
          onSave={handleSaveChild}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function ChildForm({ child, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: child?.name || '',
    birthDate: child?.birthDate || '',
    group: child?.group || '',
    notes: child?.notes || ''
  });

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
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Geburtsdatum</label>
        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Gruppe</label>
        <select
          value={formData.group}
          onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
          className="form-select"
          required
        >
          <option value="">Gruppe auswählen</option>
          <option value="WG1">WG1</option>
          <option value="WG2">WG2</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Notizen</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows="3"
          className="form-input"
        />
      </div>

      <div className="modal-footer">
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="button">
          {child ? "Speichern" : "Hinzufügen"}
        </button>
      </div>
    </form>
  );
}

export default ChildrenManagement; 