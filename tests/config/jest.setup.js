/* eslint-env jest */
// Jest setup file
import '@testing-library/jest-dom';

// Mock global fetch
globalThis.fetch = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Setup any global test utilities
globalThis.mockFetch = (data) => {
  globalThis.fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};