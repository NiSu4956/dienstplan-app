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
    <div className="documentation-view">
      <div className="documentation-header">
        <div className="header-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Alle Einträge</option>
            <option value="today">Heute</option>
            <option value="week">Letzte Woche</option>
            <option value="month">Letzter Monat</option>
            <option value="year">Letztes Jahr</option>
          </select>

          <select
            className="filter-select"
            value=""
            onChange={(e) => {
              if (e.target.value === 'csv') {
                handleExportCSV();
              } else if (e.target.value === 'pdf') {
                handleExportPDF();
              }
              e.target.value = ''; // Reset nach der Auswahl
            }}
          >
            <option value="">Download ▼</option>
            <option value="csv">Als CSV exportieren</option>
            <option value="pdf">Als PDF exportieren</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="documentation-form">
        <div className="form-group">
          <label className="form-label">Neuer Eintrag für {formatDate(selectedDate, DATE_FORMATS.DE_LONG)}</label>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows="4"
            className="form-input"
            placeholder="Tageseintrag hier eingeben..."
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="button primary" disabled={!entry.trim()}>
            Eintrag speichern
          </button>
        </div>
      </form>

      <div className="documentation-list">
        {Object.entries(groupedDocs).map(([date, docs]) => (
          <div key={date} className="documentation-day">
            <h4 className="documentation-date">
              {formatDate(normalizeDate(date), DATE_FORMATS.DE_LONG)}
            </h4>
            <div className="documentation-entries">
              {docs.map(doc => (
                <div key={doc.id} className="documentation-entry">
                  <div className="documentation-content">
                    <div className="documentation-header">
                      <p>{doc.text}</p>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="button delete-button"
                        title="Dokumentation löschen"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="documentation-meta">
                      <div>Dokumentiert von: {doc.employeeName}</div>
                      {doc.shiftInfo && (
                        <div className="shift-info">
                          Während der Schicht: {doc.shiftInfo.type}
                          {doc.shiftInfo.startTime && doc.shiftInfo.endTime && (
                            <span> ({doc.shiftInfo.startTime} - {doc.shiftInfo.endTime} Uhr)</span>
                          )}
                        </div>
                      )}
                      <div className="documentation-timestamps">
                        <div>Erstellt am: {formatDateTime(doc.timestamp)}</div>
                        {doc.lastModified && doc.lastModified !== doc.timestamp && (
                          <div>Zuletzt bearbeitet: {formatDateTime(doc.lastModified)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="no-documentation">
            Keine Dokumentationen für den ausgewählten Zeitraum gefunden.
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="button secondary" onClick={onCancel}>
          Schließen
        </button>
      </div>
    </div>
  );
}

export default DocumentationForm; 