import React, { useState } from 'react';
import Modal from './common/Modal';
import RequestForm from './requests/RequestForm';
import { formatDate } from '../utils/dateUtils';

function EmployeePortal({ currentUser, requests, onSubmitRequest, scheduleData, shiftTypes }) {
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState('vacation');

  const userRequests = requests.filter(req => req.employeeName === currentUser.name);
  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  const processedRequests = userRequests.filter(req => req.status !== 'pending');

  const handleSubmitRequest = (formData) => {
    onSubmitRequest({
      ...formData,
      submittedAt: new Date().toISOString()
    });
    
    setShowModal(false);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Ausstehend';
      case 'approved':
        return 'Genehmigt';
      case 'rejected':
        return 'Abgelehnt';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className="employee-portal">
      <div className="portal-header">
        <h2>Mitarbeiterportal - {currentUser.name}</h2>
        <div className="portal-actions">
          <button 
            className="button" 
            onClick={() => {
              setFormType('vacation');
              setShowModal(true);
            }}
          >
            Urlaub beantragen
          </button>
          <button 
            className="button" 
            onClick={() => {
              setFormType('sick');
              setShowModal(true);
            }}
          >
            Krankmeldung einreichen
          </button>
        </div>
      </div>

      <div className="requests-section">
        <h3>Meine Anträge</h3>
        
        {userRequests.length === 0 ? (
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
                        {request.type === 'vacation' ? 'Urlaub' : 'Krankmeldung'}
                      </span>
                      <span className={`request-status ${getStatusClass(request.status)}`}>
                        {getStatusText(request.status)}
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
                        {request.type === 'vacation' ? 'Urlaub' : 'Krankmeldung'}
                      </span>
                      <span className={`request-status ${getStatusClass(request.status)}`}>
                        {getStatusText(request.status)}
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
        title={formType === 'vacation' ? 'Urlaub beantragen' : 'Krankmeldung einreichen'}
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