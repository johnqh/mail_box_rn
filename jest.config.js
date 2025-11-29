module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*|@react-native-.*|@tanstack|@sudobility)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@di/(.*)$': '<rootDir>/src/di/$1',
    '^@i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@wallet/(.*)$': '<rootDir>/src/wallet/$1',
    // Native module mocks - match any path to react-native-config
    'react-native-config': '<rootDir>/__mocks__/react-native-config.js',
  },
  // Handle linked packages
  resolver: undefined,
};
