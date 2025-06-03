import React, { useState } from 'react';
import Modal from '../common/Modal';

function ChildManagement({ children, setChildren }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    group: 'WG1'
  });

  const handleAddChild = () => {
    setCurrentChild(null);
    setFormData({
      name: '',
      group: 'WG1'
    });
    setModalOpen(true);
  };

  const handleEditChild = (child) => {
    setCurrentChild(child);
    setFormData({
      name: child.name,
      group: child.group
    });
    setModalOpen(true);
  };

  const handleDeleteChild = (id) => {
    if (window.confirm('Möchten Sie dieses Kind wirklich löschen?')) {
      setChildren(prev => prev.filter(child => child.id !== id));
    }
  };

  const handleSaveChild = (e) => {
    e.preventDefault();
    
    if (currentChild) {
      // Bestehendes Kind aktualisieren
      setChildren(prev => prev.map(child =>
        child.id === currentChild.id ? { ...child, ...formData } : child
      ));
    } else {
      // Neues Kind hinzufügen
      setChildren(prev => [...prev, {
        id: Date.now(),
        ...formData
      }]);
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
                Gruppe: {child.group}
              </div>
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
        title={currentChild ? "Kind bearbeiten" : "Neues Kind"}
      >
        <form onSubmit={handleSaveChild}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gruppe</label>
            <select
              className="form-select"
              value={formData.group}
              onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
              required
            >
              <option value="WG1">WG1</option>
              <option value="WG2">WG2</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="button secondary" onClick={() => setModalOpen(false)}>
              Abbrechen
            </button>
            <button type="submit" className="button">
              {currentChild ? "Speichern" : "Hinzufügen"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ChildManagement; 