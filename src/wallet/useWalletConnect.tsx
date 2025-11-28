/**
 * WalletConnect v2 hook for React Native
 *
 * Provides EVM wallet connection via WalletConnect protocol
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createWalletClient, custom, type WalletClient } from 'viem';
import { mainnet } from 'viem/chains';

// WalletConnect imports
import {
  WalletConnectModal,
  useWalletConnectModal,
} from '@walletconnect/modal-react-native';

import { APP_METADATA } from './config';

const STORAGE_KEY = '@signa_wc_session';

// Get project ID from environment
const getProjectId = (): string => {
  // react-native-config reads from .env
  try {
    const Config = require('react-native-config').default;
    return Config.WALLETCONNECT_PROJECT_ID || '';
  } catch {
    console.warn('[WalletConnect] Failed to read project ID from config');
    return '';
  }
};

export interface WalletConnectState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface UseWalletConnectReturn extends WalletConnectState {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  walletClient: WalletClient | null;
}

export function useWalletConnect(): UseWalletConnectReturn {
  const projectId = getProjectId();
  const { open, isOpen, provider, isConnected: wcIsConnected } = useWalletConnectModal();

  const [state, setState] = useState<WalletConnectState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const connectResolveRef = useRef<((value: boolean) => void) | null>(null);

  // Load saved session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const session = JSON.parse(saved);
          if (session.address && session.chainId) {
            setState(prev => ({
              ...prev,
              address: session.address,
              chainId: session.chainId,
              isConnected: true,
            }));
          }
        }
      } catch (error) {
        console.error('[WalletConnect] Failed to load session:', error);
      }
    };
    loadSession();
  }, []);

  // Update state when provider connection changes
  useEffect(() => {
    const setupProvider = async () => {
      if (provider && wcIsConnected) {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
          const chainIdHex = await provider.request({ method: 'eth_chainId' }) as string;
          const chainId = parseInt(chainIdHex, 16);

          if (accounts[0]) {
            const address = accounts[0];

            // Save session
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ address, chainId }));

            // Create viem wallet client
            const client = createWalletClient({
              chain: mainnet,
              transport: custom(provider),
            });
            setWalletClient(client);

            setState(prev => ({
              ...prev,
              address,
              chainId,
              isConnected: true,
              isConnecting: false,
              error: null,
            }));

            // Resolve pending connect promise
            if (connectResolveRef.current) {
              connectResolveRef.current(true);
              connectResolveRef.current = null;
            }
          }
        } catch (error) {
          console.error('[WalletConnect] Setup error:', error);
          setState(prev => ({
            ...prev,
            isConnecting: false,
            error: error instanceof Error ? error.message : 'Connection failed',
          }));

          if (connectResolveRef.current) {
            connectResolveRef.current(false);
            connectResolveRef.current = null;
          }
        }
      }
    };

    setupProvider();
  }, [provider, wcIsConnected]);

  // Handle modal close without connection
  useEffect(() => {
    if (!isOpen && state.isConnecting && !wcIsConnected) {
      setState(prev => ({ ...prev, isConnecting: false }));
      if (connectResolveRef.current) {
        connectResolveRef.current(false);
        connectResolveRef.current = null;
      }
    }
  }, [isOpen, state.isConnecting, wcIsConnected]);

  /**
   * Connect to a wallet via WalletConnect modal
   */
  const connect = useCallback(async (): Promise<boolean> => {
    if (!projectId) {
      setState(prev => ({
        ...prev,
        error: 'WalletConnect Project ID not configured',
      }));
      return false;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    return new Promise<boolean>((resolve) => {
      connectResolveRef.current = resolve;

      // Open the WalletConnect modal
      open().catch((error: Error) => {
        console.error('[WalletConnect] Modal error:', error);
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: error.message,
        }));
        resolve(false);
        connectResolveRef.current = null;
      });
    });
  }, [projectId, open]);

  /**
   * Disconnect from wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      if (provider) {
        await provider.disconnect();
      }
      await AsyncStorage.removeItem(STORAGE_KEY);
      setWalletClient(null);
      setState({
        address: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      console.error('[WalletConnect] Disconnect error:', error);
    }
  }, [provider]);

  /**
   * Sign a message with the connected wallet
   */
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!provider || !state.address) {
      setState(prev => ({ ...prev, error: 'No wallet connected' }));
      return null;
    }

    try {
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, state.address],
      }) as string;

      return signature;
    } catch (error) {
      console.error('[WalletConnect] Sign error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Signing failed',
      }));
      return null;
    }
  }, [provider, state.address]);

  return {
    ...state,
    connect,
    disconnect,
    signMessage,
    walletClient,
  };
}

/**
 * WalletConnect Provider Component
 *
 * Wrap your app with this to enable WalletConnect modal
 */
export function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  const projectId = getProjectId();

  if (!projectId) {
    console.warn('[WalletConnect] No project ID configured - wallet connections will fail');
  }

  return (
    <>
      {children}
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={APP_METADATA}
      />
    </>
  );
}
