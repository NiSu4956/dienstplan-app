import React, { useState, useMemo } from 'react';
import Modal from './common/Modal';
import RequestForm from './requests/RequestForm';
import { formatDate } from '../utils/dateUtils';
import { REQUEST_TYPES, REQUEST_STATUS_TEXT, REQUEST_STATUS_CLASS } from '../constants';

function EmployeePortal({ currentUser, requests, onSubmitRequest, scheduleData, shiftTypes }) {
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState(REQUEST_TYPES.VACATION);

  // Memoize filtered requests
  const { pendingRequests, processedRequests } = useMemo(() => {
    const userRequests = requests.filter(req => req.employeeName === currentUser.name);
    return {
      pendingRequests: userRequests.filter(req => req.status === 'pending'),
      processedRequests: userRequests.filter(req => req.status !== 'pending')
    };
  }, [requests, currentUser.name]);

  const handleSubmitRequest = (formData) => {
    onSubmitRequest({
      ...formData,
      submittedAt: new Date().toISOString()
    });
    setShowModal(false);
  };

  return (
    <div className="employee-portal">
      <div className="portal-header">
        <h2>Mitarbeiterportal - {currentUser.name}</h2>
        <div className="portal-actions">
          <button 
            className="button" 
            onClick={() => {
              setFormType(REQUEST_TYPES.VACATION);
              setShowModal(true);
            }}
          >
            Urlaub beantragen
          </button>
          <button 
            className="button" 
            onClick={() => {
              setFormType(REQUEST_TYPES.SICK);
              setShowModal(true);
            }}
          >
            Krankmeldung einreichen
          </button>
        </div>
      </div>

      <div className="requests-section">
        <h3>Meine Anträge</h3>
        
        {pendingRequests.length === 0 && processedRequests.length === 0 ? (
          <div className="empty-state">
            Keine Anträge vorhanden
          </div>
        ) : (
          <>
            {pendingRequests.length > 0 && (
              <div className="request-list">
                <h4>Ausstehende Anträge</h4>
                {pendingRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <span className={`request-type ${request.type}`}>
                        {request.type === REQUEST_TYPES.VACATION ? 'Urlaub' : 'Krankmeldung'}
                      </span>
                      <span className={`request-status ${REQUEST_STATUS_CLASS[request.status]}`}>
                        {REQUEST_STATUS_TEXT[request.status]}
                      </span>
                    </div>
                    <div className="request-dates">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </div>
                    {request.notes && (
                      <div className="request-notes">
                        {request.notes}
                      </div>
                    )}
                    <div className="request-timestamp">
                      Eingereicht am: {formatDate(request.submittedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {processedRequests.length > 0 && (
              <div className="request-list">
                <h4>Bearbeitete Anträge</h4>
                {processedRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <span className={`request-type ${request.type}`}>
                        {request.type === REQUEST_TYPES.VACATION ? 'Urlaub' : 'Krankmeldung'}
                      </span>
                      <span className={`request-status ${REQUEST_STATUS_CLASS[request.status]}`}>
                        {REQUEST_STATUS_TEXT[request.status]}
                      </span>
                    </div>
                    <div className="request-dates">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </div>
                    {request.notes && (
                      <div className="request-notes">
                        {request.notes}
                      </div>
                    )}
                    {request.adminComment && (
                      <div className="admin-comment">
                        <strong>Kommentar:</strong> {request.adminComment}
                      </div>
                    )}
                    <div className="request-timestamp">
                      Eingereicht am: {formatDate(request.submittedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={formType === REQUEST_TYPES.VACATION ? 'Urlaub beantragen' : 'Krankmeldung einreichen'}
      >
        <RequestForm
          type={formType}
          onSubmit={handleSubmitRequest}
          onCancel={() => setShowModal(false)}
          currentUser={currentUser}
          scheduleData={scheduleData}
          shiftTypes={shiftTypes}
        />
      </Modal>
    </div>
  );
}

export default EmployeePortal; 