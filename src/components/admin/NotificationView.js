import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import { validateRequest } from '../../utils/requestHandler';
import { formatDate } from '../../utils/dateUtils';

const REQUEST_TYPES = {
  VACATION: 'vacation',
  SICK: 'sick'
};

const REQUEST_STATUS = {
  PENDING: 'pending'
};

const INITIAL_STATE = {
  showModal: false,
  selectedRequest: null,
  adminComment: '',
  validationError: ''
};

function NotificationView({ requests, onApproveRequest, onRejectRequest, scheduleData, shiftTypes, employees }) {
  const [showModal, setShowModal] = useState(INITIAL_STATE.showModal);
  const [selectedRequest, setSelectedRequest] = useState(INITIAL_STATE.selectedRequest);
  const [adminComment, setAdminComment] = useState(INITIAL_STATE.adminComment);
  const [validationError, setValidationError] = useState(INITIAL_STATE.validationError);

  const pendingRequests = requests.filter(req => req.status === REQUEST_STATUS.PENDING);
  const processedRequests = requests.filter(req => req.status !== REQUEST_STATUS.PENDING);

  const resetModalState = () => {
    setShowModal(INITIAL_STATE.showModal);
    setSelectedRequest(INITIAL_STATE.selectedRequest);
    setAdminComment(INITIAL_STATE.adminComment);
    setValidationError(INITIAL_STATE.validationError);
  };

  const handleApprove = () => {
    const validation = validateRequest(selectedRequest, scheduleData, shiftTypes, employees);
    
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    setValidationError('');
    onApproveRequest({ ...selectedRequest, adminComment });
    resetModalState();
  };

  const handleReject = () => {
    onRejectRequest({ ...selectedRequest, adminComment });
    resetModalState();
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setValidationError('');
    setShowModal(true);
  };

  const renderRequestDetails = (request) => (
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
  );

  const renderRequestActions = (request) => (
    request.status === REQUEST_STATUS.PENDING && (
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
    )
  );

  const renderRequest = (request) => (
    <div key={request.id} className="notification-card">
      <div className="notification-content">
        <div className="notification-header">
          <span className={`request-type ${request.type}`}>
            {request.type === REQUEST_TYPES.VACATION ? 'Urlaub' : 'Krankmeldung'}
          </span>
          <span className="request-date">
            {request.submittedAt ? formatDate(request.submittedAt) : ''}
          </span>
        </div>
        <div className="notification-body">
          <div className="employee-name">{request.employeeName}</div>
          {renderRequestDetails(request)}
        </div>
      </div>
      {renderRequestActions(request)}
    </div>
  );

  const renderRequestSection = (title, requestList) => (
    <div className="notification-section">
      <h4>{title}</h4>
      <div className="notification-list">
        {requestList.map(request => renderRequest(request))}
      </div>
    </div>
  );

  const renderModal = () => (
    <Modal
      isOpen={showModal}
      onClose={resetModalState}
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
          onClick={resetModalState}
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
          {pendingRequests.length > 0 && renderRequestSection('Offene Anfragen', pendingRequests)}
          {processedRequests.length > 0 && renderRequestSection('Bearbeitete Anfragen', processedRequests)}
        </>
      )}
      {renderModal()}
    </div>
  );
}

NotificationView.propTypes = {
  requests: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf([REQUEST_TYPES.VACATION, REQUEST_TYPES.SICK]).isRequired,
    status: PropTypes.string.isRequired,
    employeeName: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    notes: PropTypes.string,
    adminComment: PropTypes.string,
    submittedAt: PropTypes.string
  })).isRequired,
  onApproveRequest: PropTypes.func.isRequired,
  onRejectRequest: PropTypes.func.isRequired,
  scheduleData: PropTypes.object.isRequired,
  shiftTypes: PropTypes.array.isRequired,
  employees: PropTypes.array.isRequired
};

export default NotificationView; 