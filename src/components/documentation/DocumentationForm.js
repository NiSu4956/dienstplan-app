import React, { useState, useMemo } from 'react';
import { formatDate, formatDateTime, DATE_FORMATS } from '../../utils/dateUtils';
import { normalizeDate } from '../../utils/commonUtils';
import jsPDF from 'jspdf';

function DocumentationForm({ child, children, currentUser, onSave, onCancel }) {
  const [documentationText, setDocumentationText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleExportCSV = () => {
    if (!child) return;

    const docs = child.documentation;
    let csvContent = "Datum der Schicht;Schichttyp;Schichtzeit;Dokumentation;Erstellt von;Erstellt am;Zuletzt bearbeitet\n";
    
    docs.forEach(doc => {
      const shiftDate = doc.shiftInfo?.date ? formatDate(normalizeDate(doc.shiftInfo.date)) : '';
      const shiftType = doc.shiftInfo?.type || '';
      const shiftTime = doc.shiftInfo?.startTime && doc.shiftInfo?.endTime 
        ? `${doc.shiftInfo.startTime} - ${doc.shiftInfo.endTime}`
        : '';
      const text = doc.text.replace(/"/g, '""'); // Escape quotes
      const createdAt = formatDateTime(doc.timestamp);
      const lastModified = doc.lastModified && doc.lastModified !== doc.timestamp 
        ? formatDateTime(doc.lastModified)
        : '';

      csvContent += `"${shiftDate}";"${shiftType}";"${shiftTime}";"${text}";"${doc.employeeName}";"${createdAt}";"${lastModified}"\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dokumentation_${child.name}_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!child) return;

    try {
      // Erstelle ein neues PDF-Dokument
      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Titel
      doc.setFontSize(16);
      doc.text(`Dokumentation für ${child.name}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Erstellungsdatum
      doc.setFontSize(12);
      doc.text(`Erstellt am ${formatDateTime(new Date())}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;

      // Dokumentationseinträge
      child.documentation.forEach(entry => {
        const shiftDate = entry.shiftInfo?.date ? formatDate(normalizeDate(entry.shiftInfo.date)) : '';
        const shiftType = entry.shiftInfo?.type || '';
        const shiftTime = entry.shiftInfo?.startTime && entry.shiftInfo?.endTime 
          ? `(${entry.shiftInfo.startTime} - ${entry.shiftInfo.endTime} Uhr)` 
          : '';

        // Neue Seite wenn nötig
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Schichtinformationen
        doc.setFontSize(11);
        doc.setFont('Helvetica', 'italic');
        doc.text(`Schicht am ${shiftDate} ${shiftType} ${shiftTime}`, margin, yPos);
        yPos += 7;

        // Dokumentationstext
        doc.setFont('Helvetica', 'normal');
        const splitText = doc.splitTextToSize(entry.text, contentWidth);
        doc.text(splitText, margin, yPos);
        yPos += splitText.length * 7;

        // Metadaten
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Grau
        doc.text(`Dokumentiert von: ${entry.employeeName}`, margin, yPos);
        yPos += 5;
        doc.text(`Erstellt am: ${formatDateTime(entry.timestamp)}`, margin, yPos);
        
        if (entry.lastModified && entry.lastModified !== entry.timestamp) {
          yPos += 5;
          doc.text(`Zuletzt bearbeitet: ${formatDateTime(entry.lastModified)}`, margin, yPos);
        }
        yPos += 15;

        // Textfarbe zurücksetzen
        doc.setTextColor(0, 0, 0);
      });

      // PDF speichern
      doc.save(`dokumentation_${child.name}_${formatDate(new Date())}.pdf`);
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error);
      alert('Beim Erstellen des PDFs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
    }
  };

  const handleDelete = (docId) => {
    if (window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      onSave({
        action: 'delete',
        docId: docId,
        childId: child.id
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (documentationText.trim()) {
      onSave({
        childId: child.id,
        text: documentationText,
        timestamp: new Date().toISOString(),
        employeeId: currentUser?.id || null
      });
      setDocumentationText('');
    }
  };

  // Sortiere die Dokumentationen nach Schichtdatum (neueste zuerst)
  const sortedDocs = useMemo(() => {
    return [...(child?.documentation || [])].sort((a, b) => {
      const dateA = a.shiftInfo?.date ? normalizeDate(a.shiftInfo.date) : normalizeDate(a.timestamp);
      const dateB = b.shiftInfo?.date ? normalizeDate(b.shiftInfo.date) : normalizeDate(b.timestamp);
      return dateB - dateA;
    });
  }, [child?.documentation]);

  // Filtere die Dokumentationen basierend auf der Auswahl
  const filteredDocs = useMemo(() => {
    return sortedDocs.filter(doc => {
      if (selectedFilter === 'all') return true;

      const docDate = doc.shiftInfo?.date ? normalizeDate(doc.shiftInfo.date) : normalizeDate(doc.timestamp);
      if (!docDate || isNaN(docDate.getTime())) return false;

      if (selectedFilter === 'today') {
        const today = normalizeDate(new Date());
        return docDate.getTime() === today.getTime();
      }
      if (selectedFilter === 'week') {
        const oneWeekAgo = normalizeDate(new Date());
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return docDate >= oneWeekAgo;
      }
      if (selectedFilter === 'month') {
        const oneMonthAgo = normalizeDate(new Date());
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return docDate >= oneMonthAgo;
      }
      if (selectedFilter === 'year') {
        const oneYearAgo = normalizeDate(new Date());
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return docDate >= oneYearAgo;
      }
      return true;
    });
  }, [sortedDocs, selectedFilter]);

  // Gruppiere Dokumentationen nach Schichtdatum
  const groupedDocs = useMemo(() => {
    return filteredDocs.reduce((groups, doc) => {
      const docDate = doc.shiftInfo?.date ? normalizeDate(doc.shiftInfo.date) : normalizeDate(doc.timestamp);
      if (!docDate || isNaN(docDate.getTime())) return groups;
      
      // Erstelle einen konsistenten Datums-Key im lokalen Format
      const dateKey = docDate.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(doc);
      return groups;
    }, {});
  }, [filteredDocs]);

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
            value={documentationText}
            onChange={(e) => setDocumentationText(e.target.value)}
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
          <button type="submit" className="button primary" disabled={!documentationText.trim()}>
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
                        onClick={() => handleDelete(doc.id)}
                        className="button delete-button"
                        title="Dokumentation löschen"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          opacity: 0.6,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.opacity = 1}
                        onMouseOut={(e) => e.target.style.opacity = 0.6}
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
    </div>
  );
}

export default DocumentationForm; 