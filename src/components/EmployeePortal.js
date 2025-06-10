import React, { useState, useMemo } from 'react';
import Modal from './common/Modal';
import RequestForm from './requests/RequestForm';
import RequestList from './requests/RequestList';
import { formatDate } from '../utils/dateUtils';
import { REQUEST_TYPES, REQUEST_STATUS_TEXT, REQUEST_STATUS_CLASS } from '../constants';
import PropTypes from 'prop-types';

function EmployeePortal({ currentUser, requests, onSubmitRequest, scheduleData, shiftTypes }) {
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState(REQUEST_TYPES.VACATION);

  // Memoize filtered requests
  const { pendingRequests, processedRequests, existingRequests } = useMemo(() => {
    const userRequests = requests.filter(req => req.employeeName === currentUser.name);
    return {
      pendingRequests: userRequests.filter(req => req.status === 'pending'),
      processedRequests: userRequests.filter(req => req.status !== 'pending'),
      existingRequests: userRequests.filter(req => req.status === 'approved' && req.type === REQUEST_TYPES.VACATION)
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
        <h2>Mitarbeiter Portal</h2>
        <div className="request-actions">
          <button 
            className="button primary"
            onClick={() => {
              setFormType(REQUEST_TYPES.VACATION);
              setShowModal(true);
            }}
          >
            Urlaub beantragen
          </button>
          <button 
            className="button secondary"
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
        <RequestList 
          requests={pendingRequests} 
          title="Ausstehende Anträge" 
        />
        <RequestList 
          requests={processedRequests} 
          title="Bearbeitete Anträge" 
        />
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
          existingRequests={existingRequests}
        />
      </Modal>
    </div>
  );
}

EmployeePortal.propTypes = {
  currentUser: PropTypes.object.isRequired,
  requests: PropTypes.array.isRequired,
  onSubmitRequest: PropTypes.func.isRequired,
  scheduleData: PropTypes.object.isRequired,
  shiftTypes: PropTypes.array.isRequired
};

export default EmployeePortal; 