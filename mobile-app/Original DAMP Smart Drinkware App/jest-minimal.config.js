/**
 * DAMP Smart Drinkware - Minimal Jest Configuration
 * Basic Jest setup for testing Google engineering optimizations
 */

module.exports = {
  testEnvironment: 'node',

  // Test directories
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts|tsx|js)'
  ],

  // Module paths for our alias system
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },

  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest-setup-minimal.ts'],

  // Coverage
  collectCoverage: false,
  verbose: true,

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],

  // Transform ignore patterns for React Native modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo)/)'
  ],

  // Global variables
  globals: {
    '__DEV__': true
  }
};