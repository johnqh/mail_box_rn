import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type ChainType = 'evm' | 'solana';

interface AuthState {
  isConnected: boolean;
  isAuthenticated: boolean;
  address: string | null;
  chainType: ChainType | null;
}

interface AuthContextType extends AuthState {
  connect: (address: string, chainType: ChainType) => void;
  authenticate: () => Promise<void>;
  disconnect: () => void;
}

const initialState: AuthState = {
  isConnected: false,
  isAuthenticated: false,
  address: null,
  chainType: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [state, setState] = useState<AuthState>(initialState);

  const connect = useCallback((address: string, chainType: ChainType) => {
    setState({
      isConnected: true,
      isAuthenticated: false,
      address,
      chainType,
    });
  }, []);

  const authenticate = useCallback(async () => {
    // TODO: Implement actual authentication with backend
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
    }));
  }, []);

  const disconnect = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      connect,
      authenticate,
      disconnect,
    }),
    [state, connect, authenticate, disconnect]
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
