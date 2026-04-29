module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/tests/**/*.test.[jt]s?(x)',
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/src/tests/styleMock.js',
  },
};
