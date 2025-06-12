import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initialer State
const initialState = {
  employees: [],
  requests: [],
  scheduleData: {},
  currentUser: null,
  settings: {
    workHoursLimit: 40,
    minRestTime: 11,
    notifyChanges: true,
    autoSchedule: true,
    language: 'de',
    theme: 'light'
  }
};

// Action Types
const ActionTypes = {
  SET_EMPLOYEES: 'SET_EMPLOYEES',
  SET_REQUESTS: 'SET_REQUESTS',
  SET_SCHEDULE_DATA: 'SET_SCHEDULE_DATA',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  ADD_EMPLOYEE: 'ADD_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  ADD_REQUEST: 'ADD_REQUEST',
  UPDATE_REQUEST: 'UPDATE_REQUEST'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_EMPLOYEES:
      return { ...state, employees: action.payload };
    
    case ActionTypes.SET_REQUESTS:
      return { ...state, requests: action.payload };
    
    case ActionTypes.SET_SCHEDULE_DATA:
      return { ...state, scheduleData: action.payload };
    
    case ActionTypes.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload };
    
    case ActionTypes.UPDATE_SETTINGS:
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload }
      };
    
    case ActionTypes.ADD_EMPLOYEE:
      return {
        ...state,
        employees: [...state.employees, action.payload]
      };
    
    case ActionTypes.UPDATE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        )
      };
    
    case ActionTypes.DELETE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload)
      };
    
    case ActionTypes.ADD_REQUEST:
      return {
        ...state,
        requests: [...state.requests, action.payload]
      };
    
    case ActionTypes.UPDATE_REQUEST:
      return {
        ...state,
        requests: state.requests.map(req =>
          req.id === action.payload.id ? action.payload : req
        )
      };
    
    default:
      return state;
  }
};

// Context erstellen
const AppContext = createContext();

// Provider-Komponente
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action Creators
  const setEmployees = useCallback((employees) => {
    dispatch({ type: ActionTypes.SET_EMPLOYEES, payload: employees });
  }, []);

  const setRequests = useCallback((requests) => {
    dispatch({ type: ActionTypes.SET_REQUESTS, payload: requests });
  }, []);

  const setScheduleData = useCallback((scheduleData) => {
    dispatch({ type: ActionTypes.SET_SCHEDULE_DATA, payload: scheduleData });
  }, []);

  const setCurrentUser = useCallback((user) => {
    dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: user });
  }, []);

  const updateSettings = useCallback((settings) => {
    dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings });
  }, []);

  const addEmployee = useCallback((employee) => {
    dispatch({ type: ActionTypes.ADD_EMPLOYEE, payload: employee });
  }, []);

  const updateEmployee = useCallback((employee) => {
    dispatch({ type: ActionTypes.UPDATE_EMPLOYEE, payload: employee });
  }, []);

  const deleteEmployee = useCallback((id) => {
    dispatch({ type: ActionTypes.DELETE_EMPLOYEE, payload: id });
  }, []);

  const addRequest = useCallback((request) => {
    dispatch({ type: ActionTypes.ADD_REQUEST, payload: request });
  }, []);

  const updateRequest = useCallback((request) => {
    dispatch({ type: ActionTypes.UPDATE_REQUEST, payload: request });
  }, []);

  const value = {
    state,
    setEmployees,
    setRequests,
    setScheduleData,
    setCurrentUser,
    updateSettings,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addRequest,
    updateRequest
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom Hook für den Context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext muss innerhalb eines AppProviders verwendet werden');
  }
  return context;
}; 