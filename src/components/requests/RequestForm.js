import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { de } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

function RequestForm({ type, onSubmit, onCancel }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: Date.now(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Von</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd.MM.yyyy"
          locale={de}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Bis</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd.MM.yyyy"
          locale={de}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          {type === 'vacation' ? 'Anmerkungen zum Urlaub' : 'Grund der Krankmeldung'}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-input-full"
          rows="4"
          placeholder={
            type === 'vacation' 
              ? 'Zusätzliche Informationen zum Urlaub...' 
              : 'Grund der Krankmeldung...'
          }
        />
      </div>

      <div className="modal-footer">
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="button">
          {type === 'vacation' ? 'Urlaub beantragen' : 'Krankmeldung einreichen'}
        </button>
      </div>
    </form>
  );
}

export default RequestForm; 