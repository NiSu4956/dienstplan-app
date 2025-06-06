import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { formatDate, formatDateTime, DATE_FORMATS } from '../../utils/dateUtils';
import jsPDF from 'jspdf';
import { normalizeDate, getDayDateFromWeek } from '../../utils/commonUtils';

function ChildrenManagement({ scheduleData, employees, children, setChildren }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentationModalOpen, setDocumentationModalOpen] = useState(false);
  const [selectedChildForDocs, setSelectedChildForDocs] = useState(null);

  // Funktion zum Extrahieren aller Dokumentationen aus dem Dienstplan
  const extractShiftDocumentations = (scheduleData, child) => {
    const allDocs = [];
    
    // Durchlaufe alle Wochen
    Object.entries(scheduleData).forEach(([weekKey, weekData]) => {
      // Durchlaufe alle Tage
      Object.entries(weekData).forEach(([day, dayData]) => {
        // Durchlaufe alle Zeitslots
        Object.values(dayData).forEach(timeSlots => {
          // Durchlaufe alle Schichten
          timeSlots.forEach(shift => {
            if (shift.documentations) {
              // Füge den Mitarbeiternamen und Schichtinformationen zu jeder Dokumentation hinzu
              const docsWithEmployee = shift.documentations.map(doc => ({
                ...doc,
                employeeName: employees.find(emp => emp.id === doc.employeeId)?.name || 'Unbekannter Mitarbeiter',
                shiftInfo: {
                  name: shift.isCustom ? shift.customTitle : shift.name,
                  type: shift.isCustom ? shift.customTitle : shift.task,
                  startTime: shift.isCustom ? shift.customStartTime : shift.startTime,
                  endTime: shift.isCustom ? shift.customEndTime : shift.endTime,
                  date: getDayDateFromWeek(weekKey, day)
                }
              }));
              allDocs.push(...docsWithEmployee);
            }
          });
        });
      });
    });
    
    // Finde alle Dokumentationen für dieses Kind
    const childDocs = allDocs.filter(doc => doc.childId === child.id);
    
    // Sortiere Dokumentationen nach Datum (neueste zuerst)
    childDocs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      ...child,
      documentation: childDocs
    };
  };

  // Aktualisiere die Kinder mit den Dokumentationen aus den Schichten
  useEffect(() => {
    const updatedChildren = children.map(child => extractShiftDocumentations(scheduleData, child));
    setChildren(updatedChildren);
  }, [scheduleData, children, extractShiftDocumentations, setChildren]);

  const handleOpenDocumentation = (child) => {
    setSelectedChildForDocs(child);
    setDocumentationModalOpen(true);
  };

  // Entferne ungenutzte Funktionen oder markiere sie als ignoriert
  // eslint-disable-next-line no-unused-vars
  const handleExportCSV = () => {
    // Funktion wird später implementiert
  };

  // eslint-disable-next-line no-unused-vars
  const handleExportPDF = () => {
    // Funktion wird später implementiert
  };

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Wenn setSelectedDate später gebraucht wird, behalten wir es bei
  // und markieren es als ignoriert
  // eslint-disable-next-line no-unused-vars
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Kinderverwaltung</h2>
            <div className="card-actions">
              <div className="search-container">
          <input
            type="text"
                  className="form-input"
            placeholder="Kinder suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
              <button 
                className="button primary" 
                onClick={() => {
                  setCurrentChild(null);
                  setModalOpen(true);
                }}
              >
          Kind hinzufügen
        </button>
            </div>
      </div>

          <div className="children-list">
        {filteredChildren.map((child) => (
              <div key={child.id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-header">
                    <h3 className="list-item-title">{child.name}</h3>
                    <div className="list-item-group">{child.group}</div>
              </div>
                  <div className="list-item-details">
                    <div className="detail-item">
                      <span className="detail-label">Geburtsdatum:</span>
                      <span className="detail-value">{formatDate(child.birthDate)}</span>
              </div>
              {child.notes && (
                      <div className="detail-item">
                        <span className="detail-label">Notizen:</span>
                        <span className="detail-value">{child.notes}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Dokumentationen:</span>
                      <span className="detail-value">{child.documentation.length}</span>
                    </div>
                  </div>
                  {child.documentation.length > 0 && (
                    <div className="latest-documentation">
                      <div className="latest-documentation-header">Neuester Eintrag:</div>
                      <div className="latest-documentation-content">
                        <div className="documentation-meta-info">
                          <span>{formatDateTime(child.documentation[0].timestamp)}</span>
                          <span>Von: {child.documentation[0].employeeName}</span>
                        </div>
                        <p>{child.documentation[0].text}</p>
                      </div>
                </div>
              )}
            </div>
                <div className="list-item-actions">
                  <button
                    className="button primary"
                    onClick={() => handleOpenDocumentation(child)}
                  >
                    Dokumentationen
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setCurrentChild(child);
                      setModalOpen(true);
                    }}
                  >
                    Bearbeiten
                  </button>
                  <button
                    className="button delete"
                    onClick={() => {
                      if (window.confirm('Möchten Sie dieses Kind wirklich löschen?')) {
                        setChildren(prev => prev.filter(c => c.id !== child.id));
                      }
                    }}
                  >
                    Löschen
                  </button>
                </div>
          </div>
        ))}
        {filteredChildren.length === 0 && (
              <div className="empty-state">
                Keine Kinder gefunden.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentChild ? "Kind bearbeiten" : "Kind hinzufügen"}
      >
        <ChildForm
          child={currentChild}
          onSave={(childData) => {
            if (currentChild) {
              setChildren(prev => prev.map(child => 
                child.id === currentChild.id ? { ...child, ...childData } : child
              ));
            } else {
              setChildren(prev => [...prev, { ...childData, id: Date.now(), documentation: [] }]);
            }
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={documentationModalOpen}
        onClose={() => setDocumentationModalOpen(false)}
        title={`Dokumentationen - ${selectedChildForDocs?.name}`}
      >
        <DocumentationForm
          child={selectedChildForDocs}
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

function DocumentationForm({ child, onCancel }) {
  const [entry, setEntry] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entry.trim()) {
      // Hier müsste die onSave-Funktion aufgerufen werden, um den neuen Eintrag zu speichern
      setEntry('');
    }
  };

  // Sortiere die Dokumentationen nach Schichtdatum (neueste zuerst)
  const sortedDocs = [...(child?.documentation || [])].sort((a, b) => {
    const dateA = a.shiftInfo?.date ? normalizeDate(a.shiftInfo.date) : normalizeDate(a.timestamp);
    const dateB = b.shiftInfo?.date ? normalizeDate(b.shiftInfo.date) : normalizeDate(b.timestamp);
    return dateB - dateA;
  });

  // Filtere die Dokumentationen basierend auf der Auswahl
  const filteredDocs = sortedDocs.filter(doc => {
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

  // Gruppiere Dokumentationen nach Schichtdatum
  const groupedDocs = filteredDocs.reduce((groups, doc) => {
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
                    <p>{doc.text}</p>
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

        <div className="modal-footer">
          <button type="button" className="button secondary" onClick={onCancel}>
            Schließen
          </button>
          <button type="submit" className="button primary" disabled={!entry.trim()}>
            Eintrag speichern
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChildrenManagement; 