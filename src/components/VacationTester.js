import React, { useState } from 'react';
import { 
  runManualVacationTests, 
  runVacationUnitTests, 
  generateTestVacationData 
} from '../tests/vacationTests';

function VacationTester({ onCreateTestData }) {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      // Unit Tests ausführen
      const unitTestResults = runVacationUnitTests();
      setTestResults(unitTestResults);
      
      // Manuelle Tests ausführen
      runManualVacationTests();
      
    } catch (error) {
      console.error('Fehler beim Ausführen der Tests:', error);
    }
    setIsRunning(false);
  };

  const handleCreateTestData = () => {
    const testData = generateTestVacationData();
    onCreateTestData(testData);
  };

  return (
    <div className="vacation-tester">
      <h2>Urlaubs-Test-Tool</h2>
      
      <div className="test-controls">
        <button 
          onClick={handleRunTests}
          disabled={isRunning}
          className="test-button"
        >
          {isRunning ? 'Tests laufen...' : 'Tests ausführen'}
        </button>
        
        <button 
          onClick={handleCreateTestData}
          disabled={isRunning}
          className="test-button"
        >
          Test-Daten generieren
        </button>
      </div>

      {testResults && (
        <div className="test-results">
          <h3>Test-Ergebnisse</h3>
          <div className="results-summary">
            <div className="result-item">
              <span>Gesamt:</span>
              <span>{testResults.total}</span>
            </div>
            <div className="result-item success">
              <span>Bestanden:</span>
              <span>{testResults.passed}</span>
            </div>
            <div className="result-item error">
              <span>Fehlgeschlagen:</span>
              <span>{testResults.failed}</span>
            </div>
          </div>
        </div>
      )}

      <div className="test-info">
        <h3>Test-Szenarien:</h3>
        <ul>
          <li>Einzeltag-Urlaub</li>
          <li>Komplette Woche</li>
          <li>Wochenend-Urlaub</li>
          <li>Monatswechsel</li>
          <li>Jahreswechsel</li>
        </ul>
      </div>
    </div>
  );
}

export default VacationTester; 