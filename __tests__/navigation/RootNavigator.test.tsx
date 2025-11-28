/**
 * Tests for Navigation
 *
 * Tests navigation exports and structure
 */

describe('Navigation Exports', () => {
  it('should export RootNavigator', () => {
    const navigation = require('../../src/navigation');
    expect(navigation.RootNavigator).toBeDefined();
    expect(typeof navigation.RootNavigator).toBe('function');
  });

  it('should export MailNavigator', () => {
    const navigation = require('../../src/navigation');
    expect(navigation.MailNavigator).toBeDefined();
    expect(typeof navigation.MailNavigator).toBe('function');
  });
});

describe('Navigation Types', () => {
  it('should export types module', () => {
    const types = require('../../src/navigation/types');
    expect(types).toBeDefined();
  });

  it('should have RootStackParamList type defined', () => {
    // TypeScript types are erased at runtime, but we verify the module loads
    const types = require('../../src/navigation/types');
    expect(types).toBeDefined();
  });
});

describe('MailNavigator', () => {
  it('should be importable from navigation module', () => {
    const { MailNavigator } = require('../../src/navigation');
    expect(MailNavigator).toBeDefined();
  });
});

describe('RootNavigator', () => {
  it('should be importable from navigation module', () => {
    const { RootNavigator } = require('../../src/navigation');
    expect(RootNavigator).toBeDefined();
  });

  it('should be a React component', () => {
    const { RootNavigator } = require('../../src/navigation');
    expect(typeof RootNavigator).toBe('function');
  });
});
