import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

function ChildrenManagement() {
  const [children, setChildren] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentationModalOpen, setDocumentationModalOpen] = useState(false);
  const [selectedChildForDocs, setSelectedChildForDocs] = useState(null);

  // Beispieldaten - später durch echte Datenbank ersetzen
  useEffect(() => {
    setChildren([
      { 
        id: 1, 
        name: 'Max Mustermann', 
        birthDate: '2015-06-15', 
        group: 'WG1', 
        notes: 'Allergisch gegen Nüsse',
        documentation: [
          { id: 1, date: '2024-03-20', entry: 'Hat heute gut mitgemacht beim Basteln', createdAt: '2024-03-20T10:30:00' },
          { id: 2, date: '2024-03-19', entry: 'War beim Mittagessen unruhig', createdAt: '2024-03-19T14:15:00' }
        ]
      },
      { 
        id: 2, 
        name: 'Anna Schmidt', 
        birthDate: '2016-03-22', 
        group: 'WG2', 
        notes: 'Schwimmen am Dienstag',
        documentation: []
      },
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

  const handleOpenDocumentation = (child) => {
    setSelectedChildForDocs(child);
    setDocumentationModalOpen(true);
  };

  const handleSaveChild = (childData) => {
    if (currentChild) {
      // Bearbeiten eines existierenden Kindes
      setChildren(prev => prev.map(child => 
        child.id === currentChild.id ? { ...child, ...childData } : child
      ));
    } else {
      // Neues Kind hinzufügen
      setChildren(prev => [...prev, { ...childData, id: Date.now(), documentation: [] }]);
    }
    setModalOpen(false);
  };

  const handleAddDocumentation = (entry, selectedDate) => {
    setChildren(prev => prev.map(child => {
      if (child.id === selectedChildForDocs.id) {
        return {
          ...child,
          documentation: [
            {
              id: Date.now(),
              date: selectedDate,
              entry: entry,
              createdAt: new Date().toISOString()
            },
            ...child.documentation
          ]
        };
      }
      return child;
    }));
    setDocumentationModalOpen(false);
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
              {child.documentation && child.documentation.length > 0 && (
                <div className="text-sm text-gray-500 mt-2">
                  Letzter Eintrag: {new Date(child.documentation[0].createdAt).toLocaleDateString('de-DE')}
                </div>
              )}
            </div>
            <div className="employee-actions">
              <button
                className="button"
                onClick={() => handleOpenDocumentation(child)}
              >
                Dokumentation
              </button>
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

      <Modal
        isOpen={documentationModalOpen}
        onClose={() => setDocumentationModalOpen(false)}
        title={`Dokumentation - ${selectedChildForDocs?.name}`}
      >
        <DocumentationForm
          child={selectedChildForDocs}
          onSave={handleAddDocumentation}
          onCancel={() => setDocumentationModalOpen(false)}
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

function DocumentationForm({ child, onSave, onCancel }) {
  const [entry, setEntry] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entry.trim()) {
      onSave(entry.trim(), selectedDate);
      setEntry('');
    }
  };

  // Erstelle ein Array mit allen verfügbaren Daten
  const availableDates = [...new Set(child?.documentation.map(doc => doc.date))].sort().reverse();

  // Filtere die Einträge nach dem ausgewählten Datum
  const filteredEntries = child?.documentation.filter(doc => doc.date === selectedDate) || [];

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Einträge</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Datum:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-select text-sm"
            >
              <option value={new Date().toISOString().split('T')[0]}>Heute</option>
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {filteredEntries.map(doc => (
            <div key={doc.id} className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm text-gray-900">
                  {new Date(doc.date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(doc.createdAt).toLocaleTimeString('de-DE')}
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-600">{doc.entry}</div>
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <div className="text-gray-500 text-sm">
              Keine Einträge für {new Date(selectedDate).toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Neuer Eintrag für {new Date(selectedDate).toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</label>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows="4"
            className="form-input"
            placeholder="Tageseintrag hier eingeben..."
            required
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="button secondary" onClick={onCancel}>
            Schließen
          </button>
          <button type="submit" className="button">
            Eintrag speichern
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChildrenManagement; 