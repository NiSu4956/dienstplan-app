import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import DocumentationForm from '../documentation/DocumentationForm';
import { formatDate, formatDateTime, DATE_FORMATS } from '../../utils/dateUtils';
import jsPDF from 'jspdf';
import { normalizeDate, getDayDateFromWeek } from '../../utils/commonUtils';

function ChildrenManagement({ scheduleData, employees, children, setChildren, currentUser }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentationModalOpen, setDocumentationModalOpen] = useState(false);
  const [selectedChildForDocs, setSelectedChildForDocs] = useState(null);

  // Berechne die Dokumentationen nur wenn sich die relevanten Daten ändern
  const childrenWithDocumentation = useMemo(() => {
    return children.map(child => {
      const allDocs = [];
      
      // Füge die direkt gespeicherten Dokumentationen hinzu
      if (child.documentation && Array.isArray(child.documentation)) {
        allDocs.push(...child.documentation);
      }
      
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
                const docsWithEmployee = shift.documentations
                  .filter(doc => doc.childId === child.id)
                  .map(doc => ({
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
      
      // Sortiere Dokumentationen nach Datum (neueste zuerst)
      allDocs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return {
        ...child,
        documentation: allDocs
      };
    });
  }, [scheduleData, employees, children]);

  const handleOpenDocumentation = (child) => {
    setSelectedChildForDocs(child);
    setDocumentationModalOpen(true);
  };

  const handleSaveDocumentation = (docData) => {
    // Wenn es sich um eine Löschaktion handelt
    if (docData.action === 'delete') {
      setChildren(prev => prev.map(child => {
        if (child.id === docData.childId) {
          return {
            ...child,
            documentation: (child.documentation || []).filter(doc => doc.id !== docData.docId)
          };
        }
        return child;
      }));

      setSelectedChildForDocs(prev => {
        if (prev && prev.id === docData.childId) {
          return {
            ...prev,
            documentation: (prev.documentation || []).filter(doc => doc.id !== docData.docId)
          };
        }
        return prev;
      });
      return;
    }

    // Normales Speichern einer neuen Dokumentation
    setChildren(prev => prev.map(child => {
      if (child.id === docData.childId) {
        // Filtere den Eintrag vom 19.06.2025 "Hallo" heraus
        const filteredDocs = (child.documentation || []).filter(doc => {
          const docDate = new Date(doc.timestamp);
          return !(docDate.getFullYear() === 2025 && 
                  docDate.getMonth() === 5 && // Juni ist 5 (0-basiert)
                  docDate.getDate() === 19 && 
                  doc.text === "Hallo");
        });

        return {
          ...child,
          documentation: [
            {
              id: Date.now(),
              text: docData.text,
              timestamp: docData.timestamp,
              employeeId: docData.employeeId,
              employeeName: "Admin" // Setze "Admin" als Dokumentierender
            },
            ...filteredDocs
          ]
        };
      }
      return child;
    }));

    // Aktualisiere auch die selectedChildForDocs, damit die neue Dokumentation sofort angezeigt wird
    setSelectedChildForDocs(prev => {
      if (prev && prev.id === docData.childId) {
        // Filtere den Eintrag vom 19.06.2025 "Hallo" heraus
        const filteredDocs = (prev.documentation || []).filter(doc => {
          const docDate = new Date(doc.timestamp);
          return !(docDate.getFullYear() === 2025 && 
                  docDate.getMonth() === 5 && // Juni ist 5 (0-basiert)
                  docDate.getDate() === 19 && 
                  doc.text === "Hallo");
        });

        return {
          ...prev,
          documentation: [
            {
              id: Date.now(),
              text: docData.text,
              timestamp: docData.timestamp,
              employeeId: docData.employeeId,
              employeeName: "Admin" // Setze "Admin" als Dokumentierender
            },
            ...filteredDocs
          ]
        };
      }
      return prev;
    });
  };

  const filteredChildren = childrenWithDocumentation.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filteredChildren.map(child => (
              <div key={child.id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-header">
                    <h3 className="list-item-title">{child.name}</h3>
                    <span className="list-item-group">{child.group}</span>
                  </div>
                  <div className="list-item-details">
                    <div className="detail-item">
                      <span className="detail-label">Geburtsdatum:</span>
                      <span className="detail-value">{formatDate(child.birthDate)}</span>
                    </div>
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
                        <p style={{ 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxHeight: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}>{child.documentation[0].text}</p>
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
        {selectedChildForDocs && (
          <DocumentationForm
            child={selectedChildForDocs}
            children={children}
            currentUser={currentUser}
            onSave={handleSaveDocumentation}
            onCancel={() => setDocumentationModalOpen(false)}
          />
        )}
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