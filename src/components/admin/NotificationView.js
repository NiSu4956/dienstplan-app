import React, { useState } from 'react';
import Modal from '../common/Modal';
import { validateRequest } from '../../utils/requestHandler';

function NotificationView({ requests, onApproveRequest, onRejectRequest, scheduleData, shiftTypes, employees }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [validationError, setValidationError] = useState('');

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  const handleApprove = () => {
    // Validiere den Request vor der Genehmigung
    const validation = validateRequest(selectedRequest, scheduleData, shiftTypes, employees);
    
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    setValidationError('');
    onApproveRequest({ ...selectedRequest, adminComment });
    handleCloseModal();
  };

  const handleReject = () => {
    onRejectRequest({ ...selectedRequest, adminComment });
    handleCloseModal();
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setValidationError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setAdminComment('');
    setValidationError('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderRequest = (request) => (
    <div key={request.id} className="notification-card">
      <div className="notification-content">
        <div className="notification-header">
          <span className={`request-type ${request.type}`}>
            {request.type === 'vacation' ? 'Urlaub' : 'Krankmeldung'}
          </span>
          <span className="request-date">
            {request.submittedAt ? formatDate(request.submittedAt) : ''}
          </span>
        </div>
        <div className="notification-body">
          <div className="employee-name">{request.employeeName}</div>
          <div className="request-details">
            <div className="date-range">
              {formatDate(request.startDate)} - {formatDate(request.endDate)}
            </div>
            {request.notes && (
              <div className="request-notes">
                <strong>Anmerkungen:</strong>
                <p>{request.notes}</p>
              </div>
            )}
            {request.adminComment && (
              <div className="request-notes">
                <strong>Admin-Kommentar:</strong>
                <p>{request.adminComment}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {request.status === 'pending' && (
        <div className="notification-actions">
          <button 
            className="button approve"
            onClick={() => handleOpenModal(request)}
          >
            Genehmigen
          </button>
          <button 
            className="button reject"
            onClick={() => handleOpenModal(request)}
          >
            Ablehnen
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h3>Benachrichtigungen</h3>

      {pendingRequests.length === 0 && processedRequests.length === 0 ? (
        <div className="empty-state">
          Keine Benachrichtigungen vorhanden
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div className="notification-section">
              <h4>Offene Anfragen</h4>
              <div className="notification-list">
                {pendingRequests.map(request => renderRequest(request))}
              </div>
            </div>
          )}

          {processedRequests.length > 0 && (
            <div className="notification-section">
              <h4>Bearbeitete Anfragen</h4>
              <div className="notification-list">
                {processedRequests.map(request => renderRequest(request))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Anfrage bearbeiten"
      >
        <div className="form-group">
          <label className="form-label">Kommentar (optional)</label>
          <textarea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            className="form-input"
            rows="3"
            placeholder="Fügen Sie hier einen Kommentar hinzu..."
          />
        </div>

        {validationError && (
          <div className="error-message">
            {validationError}
          </div>
        )}

        <div className="modal-footer">
          <button 
            type="button" 
            className="button secondary"
            onClick={handleCloseModal}
          >
            Abbrechen
          </button>
          <button 
            type="button" 
            className="button reject"
            onClick={handleReject}
          >
            Ablehnen
          </button>
          <button 
            type="button" 
            className="button approve"
            onClick={handleApprove}
          >
            Genehmigen
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default NotificationView; 