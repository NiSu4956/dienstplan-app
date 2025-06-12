import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { de } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { validateRequest } from '../../utils/requestHandler';
import { REQUEST_FORM_TEXTS, DATE_PICKER_CONFIG } from '../../constants/requestFormTexts';
import { REQUEST_TYPES, REQUEST_STATUS_TEXT } from '../../constants';

type RequestStatus = keyof typeof REQUEST_STATUS_TEXT;

interface User {
  id: string;
  name: string;
  role: string;
}

interface Request {
  id?: string;
  type: typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];
  status: RequestStatus;
  employeeName?: string;
  employeeId?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  adminComment?: string;
  submittedAt?: string;
}

interface ScheduleData {
  [key: string]: any; // TODO: Define specific schedule data structure
}

interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  requiredQualifications?: string[];
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface RequestFormProps {
  type: typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];
  onSubmit: (request: Request) => void;
  onCancel: () => void;
  currentUser: User;
  scheduleData: ScheduleData;
  shiftTypes: ShiftType[];
  existingRequests: Request[];
}

function RequestForm({ type, onSubmit, onCancel, currentUser, scheduleData, shiftTypes, existingRequests }: RequestFormProps) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateDates = (start: Date, end: Date): boolean => {
    if (start > end) {
      setError('Das Enddatum muss nach dem Startdatum liegen.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!validateDates(startDate, endDate)) {
        return;
      }

      const request: Request = {
        type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes,
        employeeId: currentUser.id,
        status: 'pending' as RequestStatus
      };

      const validation = validateRequest(request, scheduleData, existingRequests) as ValidationResult;
      
      if (!validation.isValid) {
        setError(validation.message || 'Ungültige Anfrage');
        return;
      }

      await onSubmit(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const datePickerConfig = {
    ...DATE_PICKER_CONFIG,
    locale: de,
    weekStartsOn: 1 // Montag als erster Tag der Woche
  };

  return (
    <form onSubmit={handleSubmit} className="request-form">
      {error && (
        <div className="error-message" role="alert">
          <strong>{REQUEST_FORM_TEXTS.error.title}:</strong> {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="startDate">{REQUEST_FORM_TEXTS.labels.startDate}</label>
        <DatePicker
          id="startDate"
          selected={startDate}
          onChange={(date: Date) => {
            setStartDate(date);
            setError('');
          }}
          {...datePickerConfig}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">{REQUEST_FORM_TEXTS.labels.endDate}</label>
        <DatePicker
          id="endDate"
          selected={endDate}
          onChange={(date: Date) => {
            setEndDate(date);
            setError('');
          }}
          {...datePickerConfig}
          minDate={startDate}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">{REQUEST_FORM_TEXTS.labels.notes}</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
          className="form-control"
          rows={3}
          placeholder={type === REQUEST_TYPES.VACATION 
            ? REQUEST_FORM_TEXTS.placeholders.vacation 
            : REQUEST_FORM_TEXTS.placeholders.sickness}
        />
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          onClick={onCancel} 
          className="button secondary"
          disabled={isSubmitting}
        >
          {REQUEST_FORM_TEXTS.buttons.cancel}
        </button>
        <button 
          type="submit" 
          className="button primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Wird gesendet...' : (
            type === REQUEST_TYPES.VACATION 
              ? REQUEST_FORM_TEXTS.buttons.submit.vacation 
              : REQUEST_FORM_TEXTS.buttons.submit.sickness
          )}
        </button>
      </div>
    </form>
  );
}

export default RequestForm; 