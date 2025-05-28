import React, { useState } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    workHoursLimit: 40,
    minRestTime: 11,
    notifyChanges: true,
    autoSchedule: true,
    language: 'de',
    theme: 'light'
  });
  
  const [activeTab, setActiveTab] = useState('general');
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="sm:flex sm:divide-x sm:divide-gray-200">
        {/* Sidebar */}
        <nav className="sm:w-64 p-4 bg-gray-50 border-b sm:border-b-0 border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Einstellungen</h2>
          <div className="space-y-1">
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'general' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('general')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Allgemein
            </button>
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'notifications' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Benachrichtigungen
            </button>
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'system' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('system')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              System
            </button>
          </div>
        </nav>
        
        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'general' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Allgemeine Einstellungen</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-700">Wöchentliche Arbeitsstunden-Begrenzung</label>
                  <div className="flex">
                    <input 
                      type="number" 
                      value={settings.workHoursLimit}
                      onChange={(e) => setSettings({...settings, workHoursLimit: parseInt(e.target.value)})}
                      className="border border-gray-300 rounded-md px-3 py-2 w-20 mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="self-center text-gray-500">Stunden</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-700">Minimale Ruhezeit zwischen Schichten</label>
                  <div className="flex">
                    <input 
                      type="number" 
                      value={settings.minRestTime}
                      onChange={(e) => setSettings({...settings, minRestTime: parseInt(e.target.value)})}
                      className="border border-gray-300 rounded-md px-3 py-2 w-20 mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="self-center text-gray-500">Stunden</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="autoSchedule"
                    checked={settings.autoSchedule}
                    onChange={(e) => setSettings({...settings, autoSchedule: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoSchedule" className="ml-2 block text-sm text-gray-700">
                    Automatische Dienstplanerstellung aktivieren
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Benachrichtigungseinstellungen</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="notifyChanges"
                    checked={settings.notifyChanges}
                    onChange={(e) => setSettings({...settings, notifyChanges: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifyChanges" className="ml-2 block text-sm text-gray-700">
                    Benachrichtigungen bei Dienstplanänderungen
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="notifyEmail"
                    checked={settings.notifyEmail}
                    onChange={(e) => setSettings({...settings, notifyEmail: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifyEmail" className="ml-2 block text-sm text-gray-700">
                    E-Mail-Benachrichtigungen
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="notifyPush"
                    checked={settings.notifyPush}
                    onChange={(e) => setSettings({...settings, notifyPush: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifyPush" className="ml-2 block text-sm text-gray-700">
                    Push-Benachrichtigungen im Browser
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'system' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Systemeinstellungen</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-700">Sprache</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">Englisch</option>
                    <option value="fr">Französisch</option>
                  </select>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-700">Theme</label>
                  <select 
                    value={settings.theme}
                    onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="light">Hell</option>
                    <option value="dark">Dunkel</option>
                    <option value="system">Systemeinstellung</option>
                  </select>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-700">Datenexport</label>
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Als Excel exportieren
                    </button>
                    <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Als PDF exportieren
                    </button>
                    <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Datensicherung erstellen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-5 border-t border-gray-200">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
              Änderungen speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;