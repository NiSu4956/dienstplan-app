import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { de } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { validateRequest } from '../../utils/requestHandler';
import { REQUEST_FORM_TEXTS, DATE_PICKER_CONFIG } from '../../constants/requestFormTexts';
import PropTypes from 'prop-types';

function RequestForm({ type, onSubmit, onCancel, currentUser, scheduleData, shiftTypes, existingRequests }) {
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

    const validation = validateRequest(request, scheduleData, existingRequests);
    
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    onSubmit(request);
  };

  const datePickerConfig = {
    ...DATE_PICKER_CONFIG,
    locale: de,
    weekStartsOn: 1 // Montag als erster Tag der Woche
  };

  return (
    <form onSubmit={handleSubmit} className="request-form">
      {error && (
        <div className="error-message">
          <strong>{REQUEST_FORM_TEXTS.error.title}:</strong> {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="startDate">{REQUEST_FORM_TEXTS.labels.startDate}</label>
        <DatePicker
          id="startDate"
          selected={startDate}
          onChange={date => {
            setStartDate(date);
            setError('');
          }}
          {...datePickerConfig}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">{REQUEST_FORM_TEXTS.labels.endDate}</label>
        <DatePicker
          id="endDate"
          selected={endDate}
          onChange={date => {
            setEndDate(date);
            setError('');
          }}
          {...datePickerConfig}
          minDate={startDate}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">{REQUEST_FORM_TEXTS.labels.notes}</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-control"
          rows="3"
          placeholder={type === 'vacation' 
            ? REQUEST_FORM_TEXTS.placeholders.vacation 
            : REQUEST_FORM_TEXTS.placeholders.sickness}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="button secondary">
          {REQUEST_FORM_TEXTS.buttons.cancel}
        </button>
        <button type="submit" className="button primary">
          {type === 'vacation' 
            ? REQUEST_FORM_TEXTS.buttons.submit.vacation 
            : REQUEST_FORM_TEXTS.buttons.submit.sickness}
        </button>
      </div>
    </form>
  );
}

RequestForm.propTypes = {
  type: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  scheduleData: PropTypes.object.isRequired,
  shiftTypes: PropTypes.array.isRequired,
  existingRequests: PropTypes.array.isRequired
};

export default RequestForm; 