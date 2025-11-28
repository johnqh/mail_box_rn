/**
 * Solana Mobile Wallet Adapter hook for React Native
 *
 * Provides Solana wallet connection via Mobile Wallet Adapter protocol
 * Works with Phantom, Solflare, and other MWA-compatible wallets
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { Linking, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import bs58 from 'bs58';

const STORAGE_KEY = '@signa_solana_session';

// App identity for MWA
const APP_IDENTITY = {
  name: 'Signa Email',
  uri: 'https://signa.email',
  icon: 'https://signa.email/icon.png',
};

export interface SolanaMobileWalletState {
  publicKey: PublicKey | null;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  walletName: string | null;
}

export interface UseSolanaMobileWalletReturn extends SolanaMobileWalletState {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array | null>;
  signTransaction: (transaction: Transaction) => Promise<Transaction | null>;
}

const initialState: SolanaMobileWalletState = {
  publicKey: null,
  address: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  walletName: null,
};

/**
 * Hook for connecting to Solana wallets via Mobile Wallet Adapter
 */
export function useSolanaMobileWallet(): UseSolanaMobileWalletReturn {
  const [state, setState] = useState<SolanaMobileWalletState>(initialState);
  const authTokenRef = useRef<string | null>(null);

  // Load saved session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const session = JSON.parse(saved);
          if (session.address && session.authToken) {
            authTokenRef.current = session.authToken;
            setState(prev => ({
              ...prev,
              publicKey: new PublicKey(session.address),
              address: session.address,
              isConnected: true,
              walletName: session.walletName || null,
            }));
          }
        }
      } catch (error) {
        console.error('[SolanaMobileWallet] Failed to load session:', error);
      }
    };
    loadSession();
  }, []);

  /**
   * Check if a Solana wallet app is installed
   */
  const checkWalletInstalled = useCallback(async (): Promise<boolean> => {
    try {
      // Check for common Solana wallet deep links
      const wallets = [
        { scheme: 'phantom://', name: 'Phantom' },
        { scheme: 'solflare://', name: 'Solflare' },
      ];

      for (const wallet of wallets) {
        const canOpen = await Linking.canOpenURL(wallet.scheme);
        if (canOpen) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }, []);

  /**
   * Connect to a Solana wallet via Mobile Wallet Adapter
   */
  const connect = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Check if any wallet is installed
      const hasWallet = await checkWalletInstalled();
      if (!hasWallet) {
        Alert.alert(
          'No Solana Wallet Found',
          'Please install Phantom or another Solana wallet to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Install Phantom',
              onPress: () => {
                const storeUrl =
                  Platform.OS === 'ios'
                    ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
                    : 'https://play.google.com/store/apps/details?id=app.phantom';
                Linking.openURL(storeUrl);
              },
            },
          ]
        );
        setState(prev => ({ ...prev, isConnecting: false }));
        return false;
      }

      // Use Mobile Wallet Adapter to connect
      const result = await transact(async (wallet: Web3MobileWallet) => {
        // Authorize with the wallet
        const authResult = await wallet.authorize({
          cluster: 'mainnet-beta',
          identity: APP_IDENTITY,
        });

        return {
          publicKey: authResult.accounts[0]?.address,
          authToken: authResult.auth_token,
          walletName: authResult.wallet_uri_base ? 'Mobile Wallet' : 'Unknown',
        };
      });

      if (result.publicKey) {
        const publicKey = new PublicKey(result.publicKey);
        const address = publicKey.toBase58();

        // Save auth token for reauthorization
        authTokenRef.current = result.authToken;

        // Save session
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            address,
            authToken: result.authToken,
            walletName: result.walletName,
          })
        );

        setState(prev => ({
          ...prev,
          publicKey,
          address,
          isConnected: true,
          isConnecting: false,
          walletName: result.walletName,
        }));

        return true;
      }

      throw new Error('No account returned from wallet');
    } catch (error) {
      console.error('[SolanaMobileWallet] Connect error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Connection failed';

      // Handle user rejection
      if (errorMessage.includes('cancelled') || errorMessage.includes('rejected')) {
        setState(prev => ({ ...prev, isConnecting: false }));
        return false;
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [checkWalletInstalled]);

  /**
   * Disconnect from wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      // Deauthorize with the wallet if we have an auth token
      if (authTokenRef.current) {
        try {
          await transact(async (wallet: Web3MobileWallet) => {
            await wallet.deauthorize({ auth_token: authTokenRef.current! });
          });
        } catch (error) {
          console.warn('[SolanaMobileWallet] Deauthorize error:', error);
        }
      }

      // Clear storage
      await AsyncStorage.removeItem(STORAGE_KEY);
      authTokenRef.current = null;

      setState(initialState);
    } catch (error) {
      console.error('[SolanaMobileWallet] Disconnect error:', error);
    }
  }, []);

  /**
   * Sign a message with the connected wallet
   */
  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array | null> => {
      if (!state.address || !authTokenRef.current) {
        setState(prev => ({ ...prev, error: 'No wallet connected' }));
        return null;
      }

      try {
        const result = await transact(async (wallet: Web3MobileWallet) => {
          // Reauthorize first
          const authResult = await wallet.reauthorize({
            auth_token: authTokenRef.current!,
            identity: APP_IDENTITY,
          });

          // Update auth token
          authTokenRef.current = authResult.auth_token;

          // Sign the message - addresses should be base58 strings
          const signResult = await wallet.signMessages({
            addresses: [state.address!],
            payloads: [message],
          });

          return signResult[0];
        });

        return Uint8Array.from(result);
      } catch (error) {
        console.error('[SolanaMobileWallet] Sign error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Signing failed',
        }));
        return null;
      }
    },
    [state.address]
  );

  /**
   * Sign a transaction with the connected wallet
   */
  const signTransaction = useCallback(
    async (transaction: Transaction): Promise<Transaction | null> => {
      if (!state.address || !authTokenRef.current) {
        setState(prev => ({ ...prev, error: 'No wallet connected' }));
        return null;
      }

      try {
        const result = await transact(async (wallet: Web3MobileWallet) => {
          // Reauthorize first
          const authResult = await wallet.reauthorize({
            auth_token: authTokenRef.current!,
            identity: APP_IDENTITY,
          });

          // Update auth token
          authTokenRef.current = authResult.auth_token;

          // Sign the transaction
          const signedTransactions = await wallet.signTransactions({
            transactions: [transaction],
          });

          return signedTransactions[0];
        });

        return result;
      } catch (error) {
        console.error('[SolanaMobileWallet] Sign transaction error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Transaction signing failed',
        }));
        return null;
      }
    },
    [state.address]
  );

  return {
    ...state,
    connect,
    disconnect,
    signMessage,
    signTransaction,
  };
}

/**
 * Utility to encode a string message for signing
 */
export function encodeMessage(message: string): Uint8Array {
  return new TextEncoder().encode(message);
}

/**
 * Utility to decode a signature to base58
 */
export function signatureToBase58(signature: Uint8Array): string {
  return bs58.encode(signature);
}
