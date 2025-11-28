/**
 * Biometric Authentication Hook
 *
 * Provides Face ID / Touch ID / Fingerprint authentication
 * for securing wallet operations like message signing.
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

// Biometry type constants (matching react-native-biometrics)
const BIOMETRY_FACE_ID = 'FaceID';
const BIOMETRY_TOUCH_ID = 'TouchID';
const BIOMETRY_FINGERPRINT = 'Biometrics';

export type BiometryType = 'FaceID' | 'TouchID' | 'Fingerprint' | 'Biometrics' | null;

export interface BiometricsState {
  /** Whether biometrics are available on this device */
  isAvailable: boolean;
  /** Type of biometry (FaceID, TouchID, Fingerprint) */
  biometryType: BiometryType;
  /** Whether biometric keys are enrolled */
  isEnrolled: boolean;
  /** Whether biometric auth is currently in progress */
  isAuthenticating: boolean;
  /** Last error message */
  error: string | null;
}

export interface UseBiometricsReturn extends BiometricsState {
  /** Authenticate with biometrics before a sensitive operation */
  authenticate: (reason?: string) => Promise<boolean>;
  /** Check if biometrics should be required for an operation */
  shouldRequireBiometrics: () => boolean;
  /** Create biometric keys for this device */
  createKeys: () => Promise<boolean>;
  /** Delete biometric keys */
  deleteKeys: () => Promise<void>;
}

const initialState: BiometricsState = {
  isAvailable: false,
  biometryType: null,
  isEnrolled: false,
  isAuthenticating: false,
  error: null,
};

/**
 * Hook for biometric authentication
 */
export function useBiometrics(): UseBiometricsReturn {
  const [state, setState] = useState<BiometricsState>(initialState);

  /**
   * Check if biometrics are available and enrolled
   */
  const checkBiometrics = useCallback(async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      let type: BiometryType = null;
      if (available) {
        switch (biometryType) {
          case BIOMETRY_FACE_ID:
            type = 'FaceID';
            break;
          case BIOMETRY_TOUCH_ID:
            type = 'TouchID';
            break;
          case BIOMETRY_FINGERPRINT:
            type = Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';
            break;
        }
      }

      // Check if keys exist
      const { keysExist } = await rnBiometrics.biometricKeysExist();

      setState(prev => ({
        ...prev,
        isAvailable: available,
        biometryType: type,
        isEnrolled: keysExist,
        error: null,
      }));
    } catch (error) {
      console.error('[Biometrics] Check error:', error);
      setState(prev => ({
        ...prev,
        isAvailable: false,
        error: error instanceof Error ? error.message : 'Failed to check biometrics',
      }));
    }
  }, []);

  // Check biometrics availability on mount
  useEffect(() => {
    checkBiometrics();
  }, [checkBiometrics]);

  /**
   * Create biometric keys for signing
   */
  const createKeys = useCallback(async (): Promise<boolean> => {
    try {
      const { publicKey } = await rnBiometrics.createKeys();

      setState(prev => ({
        ...prev,
        isEnrolled: true,
        error: null,
      }));

      return !!publicKey;
    } catch (error) {
      console.error('[Biometrics] Create keys error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create keys',
      }));
      return false;
    }
  }, []);

  /**
   * Delete biometric keys
   */
  const deleteKeys = useCallback(async (): Promise<void> => {
    try {
      await rnBiometrics.deleteKeys();
      setState(prev => ({
        ...prev,
        isEnrolled: false,
        error: null,
      }));
    } catch (error) {
      console.error('[Biometrics] Delete keys error:', error);
    }
  }, []);

  /**
   * Authenticate with biometrics
   */
  const authenticate = useCallback(async (reason?: string): Promise<boolean> => {
    if (!state.isAvailable) {
      // Biometrics not available, allow operation to proceed
      return true;
    }

    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      const promptMessage = reason || getDefaultPromptMessage(state.biometryType);

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
        fallbackPromptMessage: 'Use passcode',
      });

      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: success ? null : 'Authentication cancelled',
      }));

      return success;
    } catch (error) {
      console.error('[Biometrics] Auth error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

      // Handle specific error cases
      if (errorMessage.includes('cancel')) {
        setState(prev => ({
          ...prev,
          isAuthenticating: false,
          error: null, // Don't show error for user cancellation
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
      }));

      return false;
    }
  }, [state.isAvailable, state.biometryType]);

  /**
   * Check if biometrics should be required
   */
  const shouldRequireBiometrics = useCallback((): boolean => {
    // Only require biometrics if available and enrolled
    return state.isAvailable && state.isEnrolled;
  }, [state.isAvailable, state.isEnrolled]);

  return {
    ...state,
    authenticate,
    shouldRequireBiometrics,
    createKeys,
    deleteKeys,
  };
}

/**
 * Get default prompt message based on biometry type
 */
function getDefaultPromptMessage(biometryType: BiometryType): string {
  switch (biometryType) {
    case 'FaceID':
      return 'Authenticate with Face ID to sign';
    case 'TouchID':
      return 'Authenticate with Touch ID to sign';
    case 'Fingerprint':
      return 'Authenticate with fingerprint to sign';
    default:
      return 'Authenticate to sign';
  }
}

/**
 * Higher-order function to wrap an operation with biometric auth
 */
export function withBiometricAuth<T>(
  operation: () => Promise<T>,
  biometrics: UseBiometricsReturn,
  reason?: string
): () => Promise<T | null> {
  return async () => {
    // Skip biometrics if not required
    if (!biometrics.shouldRequireBiometrics()) {
      return operation();
    }

    // Authenticate first
    const authenticated = await biometrics.authenticate(reason);
    if (!authenticated) {
      return null;
    }

    return operation();
  };
}

/**
 * Prompt to enable biometrics for enhanced security
 */
export async function promptEnableBiometrics(
  biometrics: UseBiometricsReturn
): Promise<boolean> {
  if (!biometrics.isAvailable) {
    return false;
  }

  if (biometrics.isEnrolled) {
    return true;
  }

  return new Promise(resolve => {
    Alert.alert(
      'Enable Biometric Security',
      `Would you like to enable ${biometrics.biometryType || 'biometric'} authentication for enhanced security when signing transactions?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Enable',
          onPress: async () => {
            const success = await biometrics.createKeys();
            resolve(success);
          },
        },
      ]
    );
  });
}
