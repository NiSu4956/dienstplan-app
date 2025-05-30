import React, { useState } from 'react';
import EmployeeView from './admin/EmployeeView';
import ShiftView from './admin/ShiftView';
import NotificationView from './admin/NotificationView';

function AdminArea({ 
  employees, 
  setEmployees, 
  shiftTypes, 
  setShiftTypes, 
  requests,
  onApproveRequest,
  onRejectRequest
}) {
  const [activeTab, setActiveTab] = useState('employees');
  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <div className="admin-area">
      <div className="admin-header">
        <h2>Admin-Bereich</h2>
        {pendingRequests.length > 0 && (
          <div className="notification-alert">
            <span className="notification-link" onClick={() => setActiveTab('notifications')}>
              {pendingRequests.length} neue Anfrage{pendingRequests.length !== 1 ? 'n' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Personal
        </button>
        <button
          className={`tab-button ${activeTab === 'shifts' ? 'active' : ''}`}
          onClick={() => setActiveTab('shifts')}
        >
          Schichttypen
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Benachrichtigungen
          {pendingRequests.length > 0 && (
            <span className="notification-badge">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'employees' && (
          <EmployeeView 
            employees={employees}
            setEmployees={setEmployees}
          />
        )}
        {activeTab === 'shifts' && (
          <ShiftView 
            shiftTypes={shiftTypes}
            setShiftTypes={setShiftTypes}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationView 
            requests={requests}
            onApproveRequest={onApproveRequest}
            onRejectRequest={onRejectRequest}
          />
        )}
      </div>
    </div>
  );
}

export default AdminArea; 