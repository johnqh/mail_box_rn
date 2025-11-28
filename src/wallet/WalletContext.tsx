import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { Linking, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { PublicKey } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import bs58 from 'bs58';

import type { ChainType, WalletType } from './config';
import { SUPPORTED_WALLETS, WALLETCONNECT_PROJECT_ID } from './config';

// Solana app identity for MWA
const SOLANA_APP_IDENTITY = {
  name: 'Signa Email',
  uri: 'https://signa.email',
  icon: 'https://signa.email/icon.png',
};

// Storage keys
const WALLET_STORAGE_KEY = '@signa_wallet';
const AUTH_STORAGE_KEY = '@signa_auth';

interface WalletState {
  address: string | null;
  chainType: ChainType | null;
  walletType: WalletType | null;
  isConnecting: boolean;
  isSigning: boolean;
  error: string | null;
}

interface SignedData {
  signature: string;
  message: string;
  timestamp: number;
}

interface WalletContextType extends WalletState {
  connect: (walletType: WalletType) => Promise<boolean>;
  signMessage: (message: string) => Promise<SignedData | null>;
  disconnect: () => Promise<void>;
  getSigningMessage: () => string;
  signedData: SignedData | null;
}

const initialState: WalletState = {
  address: null,
  chainType: null,
  walletType: null,
  isConnecting: false,
  isSigning: false,
  error: null,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: React.ReactNode;
}

/**
 * Generate a nonce for message signing
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * WalletProvider - Manages wallet connection state for React Native
 *
 * Integrates with:
 * - WalletConnect v2 for cross-wallet EVM support
 * - MetaMask deep links for direct MetaMask connection
 * - Solana Mobile Wallet Adapter for Phantom/Solflare
 */
export function WalletProvider({ children }: WalletProviderProps): React.JSX.Element {
  const [state, setState] = useState<WalletState>(initialState);
  const [signedData, setSignedData] = useState<SignedData | null>(null);

  // Solana auth token for reauthorization
  const solanaAuthTokenRef = useRef<string | null>(null);

  // WalletConnect modal hook
  const {
    open: openWalletConnect,
    isOpen: isWalletConnectOpen,
    provider: wcProvider,
    isConnected: isWalletConnectConnected,
  } = useWalletConnectModal();

  // Load saved wallet state on mount
  useEffect(() => {
    const loadSavedWallet = async () => {
      try {
        const savedWallet = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
        const savedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (savedWallet) {
          const wallet = JSON.parse(savedWallet);
          setState((prev) => ({
            ...prev,
            address: wallet.address,
            chainType: wallet.chainType,
            walletType: wallet.walletType,
          }));
        }

        if (savedAuth) {
          const auth = JSON.parse(savedAuth);
          // Only restore if not expired (24 hours)
          if (Date.now() - auth.timestamp < 24 * 60 * 60 * 1000) {
            setSignedData(auth);
          } else {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load saved wallet:', error);
      }
    };

    loadSavedWallet();
  }, []);

  // Sync WalletConnect connection state
  useEffect(() => {
    const syncWalletConnectState = async () => {
      if (wcProvider && isWalletConnectConnected) {
        try {
          const accounts = await wcProvider.request({ method: 'eth_accounts' }) as string[];

          if (accounts[0]) {
            const address = accounts[0];
            const walletData = {
              address,
              chainType: 'evm' as ChainType,
              walletType: 'walletconnect' as WalletType,
            };

            await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));

            setState((prev) => ({
              ...prev,
              ...walletData,
              isConnecting: false,
              error: null,
            }));
          }
        } catch (error) {
          console.error('[WalletProvider] Failed to sync WalletConnect state:', error);
        }
      }
    };

    syncWalletConnectState();
  }, [wcProvider, isWalletConnectConnected]);

  // Handle WalletConnect modal close without connection
  useEffect(() => {
    if (!isWalletConnectOpen && state.isConnecting && state.walletType === 'walletconnect') {
      if (!isWalletConnectConnected) {
        setState((prev) => ({ ...prev, isConnecting: false }));
      }
    }
  }, [isWalletConnectOpen, state.isConnecting, state.walletType, isWalletConnectConnected]);

  /**
   * Generate the message to be signed for authentication
   */
  const getSigningMessage = useCallback((): string => {
    const nonce = generateNonce();
    const timestamp = new Date().toISOString();
    return `Sign this message to authenticate with Signa Email

Nonce: ${nonce}
Timestamp: ${timestamp}

This signature proves you own this wallet and will not trigger any blockchain transactions.`;
  }, []);

  /**
   * Connect via WalletConnect
   */
  const connectWalletConnect = useCallback(async (): Promise<boolean> => {
    if (!WALLETCONNECT_PROJECT_ID) {
      Alert.alert(
        'Configuration Error',
        'WalletConnect Project ID is not configured. Please add it to your .env file.'
      );
      return false;
    }

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      walletType: 'walletconnect',
      error: null,
    }));

    try {
      await openWalletConnect();
      // Connection state will be updated via the useEffect above
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [openWalletConnect]);

  /**
   * Connect via MetaMask deep link
   */
  const connectMetaMask = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({
      ...prev,
      isConnecting: true,
      walletType: 'metamask',
      error: null,
    }));

    try {
      // Check if MetaMask is installed
      const metamaskDeepLink = Platform.OS === 'ios' ? 'metamask://' : 'metamask://';
      const canOpen = await Linking.canOpenURL(metamaskDeepLink);

      if (!canOpen) {
        Alert.alert(
          'MetaMask Not Installed',
          'Please install MetaMask to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Install',
              onPress: () => {
                const storeUrl =
                  Platform.OS === 'ios'
                    ? 'https://apps.apple.com/app/metamask/id1438144202'
                    : 'https://play.google.com/store/apps/details?id=io.metamask';
                Linking.openURL(storeUrl);
              },
            },
          ]
        );
        setState((prev) => ({ ...prev, isConnecting: false }));
        return false;
      }

      // For MetaMask, we use WalletConnect under the hood but open MetaMask directly
      // This triggers MetaMask to open and connect via WalletConnect
      await openWalletConnect();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [openWalletConnect]);

  /**
   * Connect via Solana Mobile Wallet Adapter (Phantom, Solflare, etc.)
   */
  const connectSolana = useCallback(async (walletType: WalletType): Promise<boolean> => {
    setState((prev) => ({
      ...prev,
      isConnecting: true,
      walletType,
      error: null,
    }));

    try {
      // Check if any Solana wallet is installed
      const wallets = [
        { scheme: 'phantom://', name: 'Phantom' },
        { scheme: 'solflare://', name: 'Solflare' },
      ];

      let hasWallet = false;
      for (const wallet of wallets) {
        const canOpen = await Linking.canOpenURL(wallet.scheme);
        if (canOpen) {
          hasWallet = true;
          break;
        }
      }

      if (!hasWallet) {
        Alert.alert(
          'No Solana Wallet Found',
          'Please install Phantom or Solflare to continue.',
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
        setState((prev) => ({ ...prev, isConnecting: false }));
        return false;
      }

      // Use Solana Mobile Wallet Adapter to connect
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.authorize({
          cluster: 'mainnet-beta',
          identity: SOLANA_APP_IDENTITY,
        });

        return {
          publicKey: authResult.accounts[0]?.address,
          authToken: authResult.auth_token,
        };
      });

      if (result.publicKey) {
        const publicKey = new PublicKey(result.publicKey);
        const address = publicKey.toBase58();

        // Save auth token for reauthorization
        solanaAuthTokenRef.current = result.authToken;

        const walletData = {
          address,
          chainType: 'solana' as ChainType,
          walletType,
          solanaAuthToken: result.authToken,
        };

        await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));

        setState((prev) => ({
          ...prev,
          address,
          chainType: 'solana',
          walletType,
          isConnecting: false,
          error: null,
        }));

        return true;
      }

      throw new Error('No account returned from wallet');
    } catch (error) {
      console.error('[WalletProvider] Solana connect error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Connection failed';

      // Handle user rejection silently
      if (errorMessage.includes('cancelled') || errorMessage.includes('rejected')) {
        setState((prev) => ({ ...prev, isConnecting: false }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  /**
   * Connect to a wallet
   */
  const connect = useCallback(
    async (walletType: WalletType): Promise<boolean> => {
      const walletInfo = SUPPORTED_WALLETS.find((w) => w.type === walletType);
      if (!walletInfo) {
        setState((prev) => ({
          ...prev,
          error: `Unknown wallet type: ${walletType}`,
        }));
        return false;
      }

      // Route to appropriate connection method
      switch (walletType) {
        case 'walletconnect':
          return connectWalletConnect();
        case 'metamask':
          return connectMetaMask();
        case 'coinbase':
          // Coinbase uses WalletConnect
          return connectWalletConnect();
        case 'phantom':
        case 'solflare':
          return connectSolana(walletType);
        default:
          setState((prev) => ({
            ...prev,
            error: `Wallet type ${walletType} not yet supported`,
          }));
          return false;
      }
    },
    [connectWalletConnect, connectMetaMask, connectSolana]
  );

  /**
   * Sign a message with the connected wallet
   */
  const signMessage = useCallback(
    async (message: string): Promise<SignedData | null> => {
      if (!state.address || !state.walletType) {
        setState((prev) => ({
          ...prev,
          error: 'No wallet connected',
        }));
        return null;
      }

      setState((prev) => ({ ...prev, isSigning: true, error: null }));

      try {
        let signature: string;

        if (state.chainType === 'evm' && wcProvider) {
          // Sign with WalletConnect provider (EVM)
          signature = await wcProvider.request({
            method: 'personal_sign',
            params: [message, state.address],
          }) as string;
        } else if (state.chainType === 'solana' && solanaAuthTokenRef.current) {
          // Sign with Solana Mobile Wallet Adapter
          const messageBytes = new TextEncoder().encode(message);

          const result = await transact(async (wallet: Web3MobileWallet) => {
            // Reauthorize first
            const authResult = await wallet.reauthorize({
              auth_token: solanaAuthTokenRef.current!,
              identity: SOLANA_APP_IDENTITY,
            });

            // Update auth token
            solanaAuthTokenRef.current = authResult.auth_token;

            // Sign the message - addresses should be base58 strings
            const signResult = await wallet.signMessages({
              addresses: [state.address!],
              payloads: [messageBytes],
            });

            return signResult[0];
          });

          // Convert signature to base58
          signature = bs58.encode(Buffer.from(result));
        } else {
          throw new Error('No wallet provider available for signing');
        }

        const signed: SignedData = {
          signature,
          message,
          timestamp: Date.now(),
        };

        // Save to storage
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(signed));

        setSignedData(signed);
        setState((prev) => ({ ...prev, isSigning: false }));

        return signed;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Signing failed';
        setState((prev) => ({
          ...prev,
          isSigning: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [state.address, state.walletType, state.chainType, wcProvider]
  );

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      // Disconnect WalletConnect if connected (EVM)
      if (wcProvider) {
        try {
          await wcProvider.disconnect();
        } catch (error) {
          console.warn('Failed to disconnect WalletConnect:', error);
        }
      }

      // Deauthorize Solana wallet if connected
      if (solanaAuthTokenRef.current) {
        try {
          await transact(async (wallet: Web3MobileWallet) => {
            await wallet.deauthorize({ auth_token: solanaAuthTokenRef.current! });
          });
        } catch (error) {
          console.warn('Failed to deauthorize Solana wallet:', error);
        }
        solanaAuthTokenRef.current = null;
      }

      // Clear storage
      await AsyncStorage.multiRemove([WALLET_STORAGE_KEY, AUTH_STORAGE_KEY]);

      // Reset state
      setState(initialState);
      setSignedData(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [wcProvider]);

  const value = useMemo(
    () => ({
      ...state,
      connect,
      signMessage,
      disconnect,
      getSigningMessage,
      signedData,
    }),
    [state, connect, signMessage, disconnect, getSigningMessage, signedData]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
