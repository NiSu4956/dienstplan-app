// Jest setup file
import '@testing-library/jest-dom';

// Mock für localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock für window.confirm
window.confirm = jest.fn();

// Mock für Date.now()
Date.now = jest.fn(() => 1487076708000);

// Mock für ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})); 