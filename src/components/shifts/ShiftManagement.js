import React, { useState } from 'react';

function ShiftManagement() {
  const [shiftTypes] = useState([
    { id: 1, name: 'Frühdienst', startTime: '07:00', endTime: '14:00', color: 'bg-blue-100', border: 'border-blue-300' },
    { id: 2, name: 'Tagesdienst', startTime: '09:00', endTime: '17:00', color: 'bg-green-100', border: 'border-green-300' },
    { id: 3, name: 'Spätdienst', startTime: '14:00', endTime: '21:00', color: 'bg-purple-100', border: 'border-purple-300' },
    { id: 4, name: 'Nachtdienst', startTime: '21:00', endTime: '07:00', color: 'bg-gray-100', border: 'border-gray-300' },
    { id: 5, name: 'Kochen', startTime: '11:00', endTime: '14:00', color: 'bg-red-100', border: 'border-red-300' },
    { id: 6, name: 'Wochenende', startTime: '09:00', endTime: '21:00', color: 'bg-yellow-100', border: 'border-yellow-300' },
  ]);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Schichtenverwaltung</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
          Schicht hinzufügen
        </button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shiftTypes.map((shift) => (
            <div 
              key={shift.id} 
              className={`${shift.color} rounded-lg p-4 border ${shift.border} shift-card`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 text-lg">{shift.name}</h3>
                <div className="flex space-x-2">
                  <button className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Zeitraum:</span>
                  <span className="ml-1">{shift.startTime} - {shift.endTime}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Dauer:</span>
                  <span className="ml-1">{
                    (() => {
                      const start = new Date(`2023-01-01T${shift.startTime}:00`);
                      const end = new Date(`2023-01-01T${shift.endTime}:00`);
                      if (end < start) end.setDate(end.getDate() + 1); // Handle overnight shifts
                      const diff = (end - start) / 1000 / 60 / 60;
                      return `${diff} Stunden`;
                    })()
                  }</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShiftManagement;