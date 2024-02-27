module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.(js|jsx|ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transform: {
    '\\.(svg)$': '<rootDir>/svgTransform.js',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};