import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { de } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { validateRequest } from '../../utils/requestHandler';

function RequestForm({ type, onSubmit, onCancel, currentUser, scheduleData, shiftTypes }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const request = {
      type,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes,
      employeeId: currentUser.id,
      status: 'pending'
    };

    const validation = validateRequest(request, scheduleData, shiftTypes);
    
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    onSubmit(request);
  };

  return (
    <form onSubmit={handleSubmit} className="request-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="startDate">Startdatum:</label>
        <DatePicker
          id="startDate"
          selected={startDate}
          onChange={date => {
            setStartDate(date);
            setError('');
          }}
          dateFormat="dd.MM.yyyy"
          locale={de}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">Enddatum:</label>
        <DatePicker
          id="endDate"
          selected={endDate}
          onChange={date => {
            setEndDate(date);
            setError('');
          }}
          dateFormat="dd.MM.yyyy"
          locale={de}
          className="form-control"
          minDate={startDate}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Anmerkungen:</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-control"
          rows="3"
          placeholder={type === 'vacation' ? 'Zusätzliche Informationen zum Urlaub...' : 'Grund der Krankmeldung...'}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="button secondary">
          Abbrechen
        </button>
        <button type="submit" className="button primary">
          {type === 'vacation' ? 'Urlaub beantragen' : 'Krankmeldung einreichen'}
        </button>
      </div>
    </form>
  );
}

export default RequestForm; 