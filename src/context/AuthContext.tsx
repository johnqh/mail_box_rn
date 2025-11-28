import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { Optional, WildduckUserAuth } from '@sudobility/types';

type ChainType = 'evm' | 'solana';

interface AuthState {
  isConnected: boolean;
  isAuthenticated: boolean;
  address: string | null;
  chainType: ChainType | null;
  wildduckUserAuth: Optional<WildduckUserAuth>;
}

interface AuthContextType extends AuthState {
  connect: (address: string, chainType: ChainType) => void;
  authenticate: () => Promise<void>;
  disconnect: () => void;
  setWildduckAuth: (auth: WildduckUserAuth) => void;
}

const initialState: AuthState = {
  isConnected: false,
  isAuthenticated: false,
  address: null,
  chainType: null,
  wildduckUserAuth: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [state, setState] = useState<AuthState>(initialState);

  const connect = useCallback((address: string, chainType: ChainType) => {
    setState((prev) => ({
      ...prev,
      isConnected: true,
      isAuthenticated: false,
      address,
      chainType,
    }));
  }, []);

  const authenticate = useCallback(async () => {
    // TODO: Implement actual authentication with WildDuck backend
    // This should call the /authenticate endpoint and get wildduckUserAuth
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      // For development, create a mock auth
      wildduckUserAuth: prev.address
        ? {
            userId: `user_${prev.address.slice(0, 8)}`,
            accessToken: 'mock_token',
            username: prev.address,
          }
        : null,
    }));
  }, []);

  const disconnect = useCallback(() => {
    setState(initialState);
  }, []);

  const setWildduckAuth = useCallback((auth: WildduckUserAuth) => {
    setState((prev) => ({
      ...prev,
      wildduckUserAuth: auth,
      isAuthenticated: true,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      connect,
      authenticate,
      disconnect,
      setWildduckAuth,
    }),
    [state, connect, authenticate, disconnect, setWildduckAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-export WildduckUserAuth type for convenience
export type { WildduckUserAuth };
