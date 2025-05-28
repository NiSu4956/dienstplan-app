import React, { useState } from 'react';

function SettingsView() {
  const [settings, setSettings] = useState({
    workHoursLimit: 40,
    minRestTime: 11,
    notifyChanges: true,
    autoSchedule: true,
    language: 'de',
    theme: 'light'
  });
  
  const [activeTab, setActiveTab] = useState('general');
  
  // Funktion zum Aktualisieren der Einstellungen
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Dummy-Funktion zum Speichern der Einstellungen
  const handleSave = () => {
    alert('Einstellungen wurden gespeichert!');
    console.log('Gespeicherte Einstellungen:', settings);
  };
  
  return (
    <div className="card">
      <h2 className="card-title">Einstellungen</h2>
      
      <div className="settings-container">
        {/* Seitenleiste mit Tabs */}
        <div className="settings-sidebar">
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              Allgemein
            </button>
            <button
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Benachrichtigungen
            </button>
            <button
              className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              System
            </button>
          </div>
        </div>
        
        {/* Inhaltsbereich */}
        <div className="settings-content">
          {activeTab === 'general' && (
            <div>
              <h3 className="settings-section-title">Allgemeine Einstellungen</h3>
              
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Wöchentliche Arbeitsstunden-Begrenzung</label>
                  <div className="form-input-group">
                    <input 
                      type="number" 
                      value={settings.workHoursLimit}
                      onChange={(e) => handleSettingChange('workHoursLimit', parseInt(e.target.value))}
                      className="form-input"
                    />
                    <span className="form-input-suffix">Stunden</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Minimale Ruhezeit zwischen Schichten</label>
                  <div className="form-input-group">
                    <input 
                      type="number" 
                      value={settings.minRestTime}
                      onChange={(e) => handleSettingChange('minRestTime', parseInt(e.target.value))}
                      className="form-input"
                    />
                    <span className="form-input-suffix">Stunden</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="form-checkbox">
                    <input 
                      type="checkbox" 
                      id="autoSchedule"
                      checked={settings.autoSchedule}
                      onChange={(e) => handleSettingChange('autoSchedule', e.target.checked)}
                      className="checkbox"
                    />
                    <label htmlFor="autoSchedule" className="checkbox-label">
                      Automatische Dienstplanerstellung aktivieren
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div>
              <h3 className="settings-section-title">Benachrichtigungseinstellungen</h3>
              
              <div className="settings-form">
                <div className="form-group">
                  <div className="form-checkbox">
                    <input 
                      type="checkbox" 
                      id="notifyChanges"
                      checked={settings.notifyChanges}
                      onChange={(e) => handleSettingChange('notifyChanges', e.target.checked)}
                      className="checkbox"
                    />
                    <label htmlFor="notifyChanges" className="checkbox-label">
                      Benachrichtigungen bei Dienstplanänderungen
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="form-checkbox">
                    <input 
                      type="checkbox" 
                      id="notifyEmail"
                      checked={settings.notifyEmail}
                      onChange={(e) => handleSettingChange('notifyEmail', e.target.checked)}
                      className="checkbox"
                    />
                    <label htmlFor="notifyEmail" className="checkbox-label">
                      E-Mail-Benachrichtigungen
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'system' && (
            <div>
              <h3 className="settings-section-title">Systemeinstellungen</h3>
              
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Sprache</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="form-select"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">Englisch</option>
                    <option value="fr">Französisch</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select 
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="form-select"
                  >
                    <option value="light">Hell</option>
                    <option value="dark">Dunkel</option>
                    <option value="system">Systemeinstellung</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Datenexport</label>
                  <div className="button-group">
                    <button className="button secondary">Als Excel exportieren</button>
                    <button className="button secondary">Als PDF exportieren</button>
                    <button className="button secondary">Datensicherung erstellen</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="form-footer">
            <button className="button" onClick={handleSave}>
              Änderungen speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;