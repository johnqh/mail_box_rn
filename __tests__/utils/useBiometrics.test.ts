/**
 * Tests for useBiometrics hook
 * Note: Uses the global mock from jest.setup.js
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBiometrics } from '../../src/utils/useBiometrics';

describe('useBiometrics', () => {
  // Using global mock from jest.setup.js which sets available: false by default

  it('should initialize with default state from mock', async () => {
    const { result } = renderHook(() => useBiometrics());

    // Wait for the initial check to complete
    await waitFor(() => {
      expect(result.current.isAuthenticating).toBe(false);
    });

    // Default mock returns available: false
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.biometryType).toBeNull();
    expect(result.current.isEnrolled).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should allow operation when biometrics unavailable', async () => {
    const { result } = renderHook(() => useBiometrics());

    await waitFor(() => {
      expect(result.current.isAuthenticating).toBe(false);
    });

    // When biometrics are unavailable, authenticate should return true
    // to allow the operation to proceed
    let authenticated: boolean = false;
    await act(async () => {
      authenticated = await result.current.authenticate();
    });

    expect(authenticated).toBe(true);
  });

  it('should not require biometrics when not enrolled', async () => {
    const { result } = renderHook(() => useBiometrics());

    await waitFor(() => {
      expect(result.current.isAuthenticating).toBe(false);
    });

    expect(result.current.shouldRequireBiometrics()).toBe(false);
  });

  it('should have correct initial state shape', () => {
    const { result } = renderHook(() => useBiometrics());

    // Check the shape of the returned object
    expect(result.current).toHaveProperty('isAvailable');
    expect(result.current).toHaveProperty('biometryType');
    expect(result.current).toHaveProperty('isEnrolled');
    expect(result.current).toHaveProperty('isAuthenticating');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('authenticate');
    expect(result.current).toHaveProperty('shouldRequireBiometrics');
    expect(result.current).toHaveProperty('createKeys');
    expect(result.current).toHaveProperty('deleteKeys');
  });

  it('should have callable methods', async () => {
    const { result } = renderHook(() => useBiometrics());

    expect(typeof result.current.authenticate).toBe('function');
    expect(typeof result.current.shouldRequireBiometrics).toBe('function');
    expect(typeof result.current.createKeys).toBe('function');
    expect(typeof result.current.deleteKeys).toBe('function');
  });
});
