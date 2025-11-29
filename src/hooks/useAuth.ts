import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthStatus = 'DISCONNECTED' | 'CONNECTED' | 'VERIFIED';

interface AuthState {
  isLoading: boolean;
  authStatus: AuthStatus;
  walletAddress: string | null;
  chainType: 'evm' | 'solana' | null;
}

const AUTH_STORAGE_KEY = '@auth/state';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    authStatus: 'DISCONNECTED',
    walletAddress: null,
    chainType: null,
  });

  // Restore auth state on mount
  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          setState({
            ...parsed,
            isLoading: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    restoreAuthState();
  }, []);

  // Save auth state when it changes
  const saveAuthState = useCallback(async (newState: Partial<AuthState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        authStatus: updatedState.authStatus,
        walletAddress: updatedState.walletAddress,
        chainType: updatedState.chainType,
      }));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }, [state]);

  const setConnected = useCallback((address: string, chainType: 'evm' | 'solana') => {
    saveAuthState({
      authStatus: 'CONNECTED',
      walletAddress: address,
      chainType,
    });
  }, [saveAuthState]);

  const setVerified = useCallback(() => {
    saveAuthState({
      authStatus: 'VERIFIED',
    });
  }, [saveAuthState]);

  const signOut = useCallback(async () => {
    setState({
      isLoading: false,
      authStatus: 'DISCONNECTED',
      walletAddress: null,
      chainType: null,
    });
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return {
    ...state,
    setConnected,
    setVerified,
    signOut,
    isAuthenticated: state.authStatus === 'VERIFIED',
  };
}

export default useAuth;
