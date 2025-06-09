import React, { useState } from 'react';
import { DAYS_OF_WEEK } from '../../constants';

function WeekOverview({ scheduleData, selectedWeek }) {
  const timeSlots = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                     '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  
  const weeks = [
    'KW 20 (12.05 - 18.05.2025)',
    'KW 21 (19.05 - 25.05.2025)',
    'KW 22 (26.05 - 01.06.2025)',
  ];
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Wochenübersicht</h2>
        <div className="flex items-center space-x-4">
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            {weeks.map((week) => (
              <option key={week} value={week}>{week}</option>
            ))}
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
            Exportieren
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="w-20 px-2 py-3 border bg-gray-50 text-left text-sm font-medium text-gray-600 sticky left-0 z-10">Zeit</th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day} className="px-3 py-3 border bg-gray-50 text-left text-sm font-medium text-gray-600">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time} className="hover:bg-gray-50">
                <td className="px-2 py-3 border bg-gray-50 text-sm text-gray-600 font-medium sticky left-0 z-10">{time}</td>
                {DAYS_OF_WEEK.map((day) => (
                  <td key={`${day}-${time}`} className="px-2 py-2 border relative schedule-cell">
                    {scheduleData[day] && scheduleData[day][time] ? (
                      <div className="flex flex-col gap-1">
                        {scheduleData[day][time].map((shift, idx) => (
                          <div 
                            key={idx} 
                            className={`${shift.color} p-2 rounded border border-gray-200 text-xs shadow-sm`}
                          >
                            <div className="font-semibold">{shift.name}</div>
                            <div>{shift.task}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button className="opacity-0 hover:opacity-100 absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-50 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WeekOverview;