import React, { useState } from 'react';
import Modal from './common/Modal';

function EmployeePortal({ currentUser, requests, onSubmitRequest }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const userRequests = requests.filter(req => req.employeeName === currentUser.name);
  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  const processedRequests = userRequests.filter(req => req.status !== 'pending');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSubmitRequest({
      ...formData,
      employeeName: currentUser.name,
      submittedAt: new Date().toISOString()
    });
    
    setShowModal(false);
    setFormData({
      type: 'vacation',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
        <button className="button" onClick={() => setShowModal(true)}>
          Antrag stellen
        </button>
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
        title="Neuer Antrag"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Art des Antrags</label>
            <select
              value={formData.type}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="form-select"
            >
              <option value="vacation">Urlaub</option>
              <option value="sick">Krankmeldung</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Von</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bis</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Anmerkungen (optional)</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="form-input"
              rows="3"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="button secondary" onClick={() => setShowModal(false)}>
              Abbrechen
            </button>
            <button type="submit" className="button">
              Absenden
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EmployeePortal; 