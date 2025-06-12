import React from 'react';
import { render } from '@testing-library/react';
import RequestList from '../../components/requests/RequestList';
import { REQUEST_TYPES } from '../../constants';

describe('RequestList', () => {
  const mockRequests = [
    {
      id: 1,
      type: REQUEST_TYPES.VACATION,
      status: 'approved',
      startDate: '2024-03-15',
      endDate: '2024-03-20',
      notes: 'Urlaub in den Bergen',
      submittedAt: '2024-03-01T10:00:00',
      adminComment: 'Genehmigt'
    },
    {
      id: 2,
      type: REQUEST_TYPES.SICK,
      status: 'pending',
      startDate: '2024-03-16',
      endDate: '2024-03-17',
      notes: 'Grippe',
      submittedAt: '2024-03-16T08:00:00'
    }
  ];

  it('sollte null zurückgeben, wenn keine Requests vorhanden sind', () => {
    const { container } = render(<RequestList requests={[]} title="Test" />);
    expect(container.firstChild).toBeNull();
  });

  it('sollte die Liste der Requests korrekt rendern', () => {
    const { container } = render(
      <RequestList 
        requests={mockRequests} 
        title="Urlaubsanträge" 
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('sollte die korrekten Status-Badges anzeigen', () => {
    const { getByText } = render(
      <RequestList 
        requests={mockRequests} 
        title="Urlaubsanträge" 
      />
    );
    
    const statusBadge = getByText('Genehmigt', { selector: '.request-status' });
    expect(statusBadge).toBeInTheDocument();
    expect(getByText('Ausstehend', { selector: '.request-status' })).toBeInTheDocument();
  });

  it('sollte die korrekten Request-Typen anzeigen', () => {
    const { getByText } = render(
      <RequestList 
        requests={mockRequests} 
        title="Urlaubsanträge" 
      />
    );
    
    const vacationType = getByText('Urlaub', { selector: '.request-type' });
    const sickType = getByText('Krankmeldung', { selector: '.request-type' });
    
    expect(vacationType).toBeInTheDocument();
    expect(sickType).toBeInTheDocument();
  });

  it('sollte Notizen und Admin-Kommentare anzeigen', () => {
    const { getByText } = render(
      <RequestList 
        requests={mockRequests} 
        title="Urlaubsanträge" 
      />
    );
    
    expect(getByText('Urlaub in den Bergen', { selector: '.request-notes' })).toBeInTheDocument();
    expect(getByText('Grippe', { selector: '.request-notes' })).toBeInTheDocument();
    expect(getByText('Kommentar:', { selector: '.admin-comment strong' })).toBeInTheDocument();
    expect(getByText('Genehmigt', { selector: '.admin-comment' })).toBeInTheDocument();
  });
}); 