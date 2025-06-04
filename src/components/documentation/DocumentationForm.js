import React, { useState } from 'react';

function DocumentationForm({ children, onSave, onCancel }) {
  const [selectedChild, setSelectedChild] = useState('');
  const [documentationText, setDocumentationText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedChild || !documentationText.trim()) return;
    
    onSave(selectedChild, documentationText.trim());
    setSelectedChild('');
    setDocumentationText('');
  };

  return (
    <form onSubmit={handleSubmit} className="documentation-form">
      <div className="form-group">
        <label htmlFor="child-select">Kind auswählen:</label>
        <select
          id="child-select"
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          required
          className="form-select"
        >
          <option value="">Bitte wählen...</option>
          {children.map(child => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="documentation-text">Dokumentation:</label>
        <textarea
          id="documentation-text"
          value={documentationText}
          onChange={(e) => setDocumentationText(e.target.value)}
          required
          className="form-textarea"
          rows="4"
          placeholder="Dokumentation eingeben..."
        />
      </div>

      <div className="form-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button 
          type="submit" 
          className="button primary"
          disabled={!selectedChild || !documentationText.trim()}
        >
          Speichern
        </button>
      </div>
    </form>
  );
}

export default DocumentationForm; 