import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeView from '../../components/EmployeeView';
import { AppProvider } from '../../contexts/AppContext';

// Mock-Funktionen
const mockSetEmployees = jest.fn();

// Test-Daten
const mockEmployees = [
  {
    id: 1,
    name: 'Max Mustermann',
    role: 'Mitarbeiter',
    qualifications: ['Qualifikation 1']
  },
  {
    id: 2,
    name: 'Anna Schmidt',
    role: 'Teamleiter',
    qualifications: ['Qualifikation 2']
  }
];

// Wrapper-Komponente
const renderWithProvider = (ui, { initialState = {}, ...renderOptions } = {}) => {
  const Wrapper = ({ children }) => (
    <AppProvider initialState={initialState}>
      {children}
    </AppProvider>
  );
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

describe('EmployeeView', () => {
  beforeEach(() => {
    mockSetEmployees.mockClear();
  });

  it('sollte die Liste der Mitarbeiter anzeigen', () => {
    renderWithProvider(<EmployeeView />, {
      initialState: { employees: mockEmployees }
    });
    
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
    expect(screen.getByText('Anna Schmidt')).toBeInTheDocument();
  });

  it('sollte Mitarbeiter basierend auf der Suche filtern', () => {
    renderWithProvider(<EmployeeView />, {
      initialState: { employees: mockEmployees }
    });
    
    const searchInput = screen.getByPlaceholderText('Mitarbeiter suchen...');
    fireEvent.change(searchInput, { target: { value: 'Max' } });
    
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
    expect(screen.queryByText('Anna Schmidt')).not.toBeInTheDocument();
  });

  it('sollte das Modal zum Hinzufügen eines Mitarbeiters öffnen', () => {
    renderWithProvider(<EmployeeView />, {
      initialState: { employees: mockEmployees }
    });
    
    const addButton = screen.getByText('Mitarbeiter hinzufügen');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Neuer Mitarbeiter')).toBeInTheDocument();
  });

  it('sollte einen Mitarbeiter bearbeiten können', () => {
    renderWithProvider(<EmployeeView />, {
      initialState: { employees: mockEmployees }
    });
    
    const editButtons = screen.getAllByText('Bearbeiten');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByText('Mitarbeiter bearbeiten')).toBeInTheDocument();
  });

  it('sollte einen Mitarbeiter löschen können', () => {
    window.confirm.mockImplementationOnce(() => true);
    
    renderWithProvider(<EmployeeView />, {
      initialState: { employees: mockEmployees }
    });
    
    const deleteButtons = screen.getAllByText('Löschen');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalled();
  });

  it('sollte keine Mitarbeiter anzeigen, wenn die Liste leer ist', () => {
    renderWithProvider(<EmployeeView />, {
      initialState: { employees: [] }
    });
    
    expect(screen.getByText('Keine Mitarbeiter gefunden')).toBeInTheDocument();
  });
}); 