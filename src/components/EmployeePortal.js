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
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired
  }).isRequired,
  requests: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    employeeName: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    notes: PropTypes.string,
    adminComment: PropTypes.string,
    submittedAt: PropTypes.string.isRequired
  })).isRequired,
  onSubmitRequest: PropTypes.func.isRequired,
  scheduleData: PropTypes.object.isRequired,
  shiftTypes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    requiredQualifications: PropTypes.arrayOf(PropTypes.string)
  })).isRequired
};

export default EmployeePortal; 