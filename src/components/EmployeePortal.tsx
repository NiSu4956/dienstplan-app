import React, { useState, useMemo } from 'react';
import Modal from './common/Modal';
import RequestForm from './requests/RequestForm';
import RequestList from './requests/RequestList';
import { formatDate } from '../utils/dateUtils';
import { REQUEST_TYPES, REQUEST_STATUS_TEXT, REQUEST_STATUS_CLASS } from '../constants';

type RequestStatus = keyof typeof REQUEST_STATUS_TEXT;

interface User {
  id: string;
  name: string;
  role: string;
}

interface Request {
  id?: string;
  type: typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];
  status: RequestStatus;
  employeeName?: string;
  employeeId?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  adminComment?: string;
  submittedAt?: string;
}

interface ScheduleData {
  [key: string]: any; // TODO: Define specific schedule data structure
}

interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  requiredQualifications?: string[];
}

interface EmployeePortalProps {
  currentUser: User;
  requests: Request[];
  onSubmitRequest: (request: Request) => void;
  scheduleData: ScheduleData;
  shiftTypes: ShiftType[];
}

function EmployeePortal({ currentUser, requests, onSubmitRequest, scheduleData, shiftTypes }: EmployeePortalProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formType, setFormType] = useState<typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES]>(REQUEST_TYPES.VACATION);

  // Memoize filtered requests
  const { pendingRequests, processedRequests, existingRequests } = useMemo(() => {
    const userRequests = requests.filter(req => req.employeeName === currentUser.name);
    return {
      pendingRequests: userRequests.filter(req => req.status === 'pending'),
      processedRequests: userRequests.filter(req => req.status !== 'pending'),
      existingRequests: userRequests.filter(req => req.status === 'approved' && req.type === REQUEST_TYPES.VACATION)
    };
  }, [requests, currentUser.name]);

  const handleSubmitRequest = (formData: Request) => {
    onSubmitRequest({
      ...formData,
      employeeName: currentUser.name,
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

export default EmployeePortal; 