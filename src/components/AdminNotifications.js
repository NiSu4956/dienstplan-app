import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

function AdminNotifications({ requests, onApprove, onReject }) {
  const [adminComment, setAdminComment] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  const handleApprove = (request) => {
    onApprove({
      ...request,
      adminComment,
      processedAt: new Date().toISOString()
    });
    setAdminComment('');
    setSelectedRequest(null);
  };

  const handleReject = (request) => {
    onReject({
      ...request,
      adminComment,
      processedAt: new Date().toISOString()
    });
    setAdminComment('');
    setSelectedRequest(null);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  };

  return (
    <div className="admin-notifications">
      <h2>Benachrichtigungen</h2>
      {pendingRequests.length > 0 && (
        <div className="pending-section">
          <h3>Ausstehende Anträge</h3>
          <div className="request-list">
            {pendingRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className="request-type">
                    {request.type === 'vacation' ? '🏖️ Urlaubsantrag' : '🏥 Krankmeldung'}
                  </span>
                  <span className="request-date">
                    Eingereicht am {formatDate(request.submittedAt)}
                  </span>
                </div>
                <div className="request-content">
                  <div className="employee-info">
                    <strong>{request.employeeName}</strong>
                  </div>
                  <div className="date-range">
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </div>
                  {request.notes && (
                    <div className="request-notes">
                      <strong>Notizen:</strong> {request.notes}
                    </div>
                  )}
                  {selectedRequest?.id === request.id ? (
                    <div className="admin-response">
                      <textarea
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        placeholder="Kommentar hinzufügen..."
                        className="form-input-full"
                        rows="2"
                      />
                      <div className="button-group">
                        <button
                          className="button"
                          onClick={() => handleApprove(request)}
                        >
                          Genehmigen
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => handleReject(request)}
                        >
                          Ablehnen
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => {
                            setSelectedRequest(null);
                            setAdminComment('');
                          }}
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="button"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Bearbeiten
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {processedRequests.length > 0 && (
        <div className="processed-section">
          <h3>Bearbeitete Anträge</h3>
          <div className="request-list">
            {processedRequests.map(request => (
              <div 
                key={request.id} 
                className={`request-card ${request.status === 'approved' ? 'approved' : 'rejected'}`}
              >
                <div className="request-header">
                  <span className="request-type">
                    {request.type === 'vacation' ? '🏖️ Urlaubsantrag' : '🏥 Krankmeldung'}
                  </span>
                  <span className={`status-badge ${request.status === 'approved' ? 'badge-green' : 'badge-red'}`}>
                    {request.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                  </span>
                </div>
                <div className="request-content">
                  <div className="employee-info">
                    <strong>{request.employeeName}</strong>
                  </div>
                  <div className="date-range">
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </div>
                  {request.notes && (
                    <div className="request-notes">
                      <strong>Notizen:</strong> {request.notes}
                    </div>
                  )}
                  {request.adminComment && (
                    <div className="admin-comment">
                      <strong>Admin-Kommentar:</strong> {request.adminComment}
                    </div>
                  )}
                  <div className="processed-info">
                    Bearbeitet am {formatDate(request.processedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications; 