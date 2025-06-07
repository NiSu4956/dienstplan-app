import React, { useState } from 'react';
import { formatDate, DATE_FORMATS } from '../utils/dateUtils';

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

  return (
    <div className="admin-notifications">
      <h3>Anfragen</h3>
      
      <div className="requests-section">
        <h4>Offene Anfragen</h4>
        {pendingRequests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <span className="employee-name">{request.employeeName}</span>
              <span className="request-type">
                {request.type === 'vacation' ? '🏖️ Urlaub' : '🏥 Krankmeldung'}
              </span>
            </div>
            <div className="request-dates">
              <div>Von: {formatDate(request.startDate)}</div>
              <div>Bis: {formatDate(request.endDate)}</div>
            </div>
            {request.notes && (
              <div className="request-notes">{request.notes}</div>
            )}
            <div className="request-actions">
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Kommentar hinzufügen..."
                className="admin-comment"
              />
              <div className="button-group">
                <button
                  onClick={() => handleApprove(request)}
                  className="button approve"
                >
                  Genehmigen
                </button>
                <button
                  onClick={() => handleReject(request)}
                  className="button reject"
                >
                  Ablehnen
                </button>
              </div>
            </div>
          </div>
        ))}
        {pendingRequests.length === 0 && (
          <p className="no-requests">Keine offenen Anfragen</p>
        )}
      </div>

      <div className="requests-section">
        <h4>Bearbeitete Anfragen</h4>
        {processedRequests.map(request => (
          <div key={request.id} className="request-card processed">
            <div className="request-header">
              <span className="employee-name">{request.employeeName}</span>
              <span className="request-type">
                {request.type === 'vacation' ? '🏖️ Urlaub' : '🏥 Krankmeldung'}
              </span>
              <span className={`status ${request.status}`}>
                {request.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
              </span>
            </div>
            <div className="request-dates">
              <div>Von: {formatDate(request.startDate)}</div>
              <div>Bis: {formatDate(request.endDate)}</div>
            </div>
            {request.notes && (
              <div className="request-notes">{request.notes}</div>
            )}
            {request.adminComment && (
              <div className="admin-comment-display">
                <strong>Admin-Kommentar:</strong> {request.adminComment}
              </div>
            )}
            <div className="processed-at">
              Bearbeitet am: {formatDate(request.processedAt, `${DATE_FORMATS.DE_SHORT} ${DATE_FORMATS.DE_TIME}`)}
            </div>
          </div>
        ))}
        {processedRequests.length === 0 && (
          <p className="no-requests">Keine bearbeiteten Anfragen</p>
        )}
      </div>
    </div>
  );
}

export default AdminNotifications; 