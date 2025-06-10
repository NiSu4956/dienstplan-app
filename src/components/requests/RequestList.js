import React from 'react';
import { formatDate } from '../../utils/dateUtils';
import { REQUEST_TYPES, REQUEST_STATUS_TEXT, REQUEST_STATUS_CLASS } from '../../constants';

function RequestList({ requests, title }) {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <div className="request-list">
      <h4>{title}</h4>
      {requests.map(request => (
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
  );
}

export default RequestList; 