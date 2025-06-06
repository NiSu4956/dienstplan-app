import React, { useState } from 'react';
import EmployeeView from './admin/EmployeeView';
import ShiftManagement from './shifts/ShiftManagement';
import ChildrenManagement from './admin/ChildrenManagement';
import NotificationView from './admin/NotificationView';

function AdminArea({ 
  employees, 
  setEmployees, 
  shiftTypes, 
  setShiftTypes, 
  requests, 
  onApproveRequest, 
  onRejectRequest,
  scheduleData,
  children,
  setChildren
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
          className={`tab-button ${activeTab === 'children' ? 'active' : ''}`}
          onClick={() => setActiveTab('children')}
        >
          Kinder
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Benachrichtigungen {pendingRequests.length > 0 && `(${pendingRequests.length})`}
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'employees' && (
          <EmployeeView 
            employees={employees} 
            setEmployees={setEmployees}
            scheduleData={scheduleData}
            shiftTypes={shiftTypes}
          />
        )}
        {activeTab === 'shifts' && (
          <ShiftManagement 
            shiftTypes={shiftTypes} 
            setShiftTypes={setShiftTypes}
            employees={employees}
          />
        )}
        {activeTab === 'children' && (
          <ChildrenManagement
            scheduleData={scheduleData}
            employees={employees}
            children={children}
            setChildren={setChildren}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationView
            requests={requests}
            onApproveRequest={onApproveRequest}
            onRejectRequest={onRejectRequest}
            scheduleData={scheduleData}
            shiftTypes={shiftTypes}
            employees={employees}
          />
        )}
      </div>
    </div>
  );
}

export default AdminArea; 