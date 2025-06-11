import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';

function DocumentationModal({
  isOpen,
  onClose,
  selectedShift,
  onSave,
  onUpdate,
  onDelete
}) {
  const [documentation, setDocumentation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (selectedShift?.documentation) {
      setDocumentation(selectedShift.documentation.content);
      setIsEditing(true);
      setEditId(selectedShift.documentation.id);
    } else {
      setDocumentation('');
      setIsEditing(false);
      setEditId(null);
    }
  }, [selectedShift]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      onUpdate(editId, documentation);
    } else {
      onSave(documentation);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editId) {
      onDelete(editId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="documentation-modal">
        <h3>Dokumentation</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="documentation">Notizen</label>
            <textarea
              id="documentation"
              value={documentation}
              onChange={(e) => setDocumentation(e.target.value)}
              className="form-control textarea"
              rows={6}
            />
          </div>
          <div className="form-actions">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="button delete"
              >
                Löschen
              </button>
            )}
            <button type="submit" className="button primary">
              {isEditing ? 'Aktualisieren' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default DocumentationModal; 