import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { Linking, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChainType, WalletType } from './config';
import { SUPPORTED_WALLETS } from './config';

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
 * For production, this would integrate with:
 * - WalletConnect v2 for cross-wallet support
 * - MetaMask Mobile SDK for direct MetaMask connection
 * - Phantom SDK for Solana wallet connection
 *
 * Current implementation provides the interface with simulated connections
 * for development and testing purposes.
 */
export function WalletProvider({ children }: WalletProviderProps): React.JSX.Element {
  const [state, setState] = useState<WalletState>(initialState);
  const [signedData, setSignedData] = useState<SignedData | null>(null);

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
   * Connect to a wallet
   */
  const connect = useCallback(async (walletType: WalletType): Promise<boolean> => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const walletInfo = SUPPORTED_WALLETS.find((w) => w.type === walletType);
      if (!walletInfo) {
        throw new Error(`Unknown wallet type: ${walletType}`);
      }

      // Check if wallet app is installed (for deep link wallets)
      if (walletInfo.deepLink) {
        const deepLink =
          Platform.OS === 'ios'
            ? walletInfo.deepLink.ios
            : walletInfo.deepLink.android;

        const canOpen = await Linking.canOpenURL(deepLink);
        if (!canOpen) {
          // Wallet not installed - show install prompt
          Alert.alert(
            `${walletInfo.name} Not Installed`,
            `Please install ${walletInfo.name} to continue.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Install',
                onPress: () => {
                  // Open app store link
                  const storeUrl =
                    Platform.OS === 'ios'
                      ? `https://apps.apple.com/search?term=${walletInfo.name}`
                      : `https://play.google.com/store/search?q=${walletInfo.name}`;
                  Linking.openURL(storeUrl);
                },
              },
            ]
          );
          setState((prev) => ({ ...prev, isConnecting: false }));
          return false;
        }
      }

      // For WalletConnect, we would initialize the WC client here
      // For direct wallet connections, we would use their respective SDKs
      // For now, simulate the connection

      // In production, this would:
      // 1. For WalletConnect: Display QR modal or deep link to wallet
      // 2. For MetaMask: Use MetaMask SDK to establish connection
      // 3. For Phantom: Use Phantom deep links with connect action

      // Simulated connection for development
      // TODO: Replace with actual wallet SDK integration
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      // Generate a simulated address based on chain type
      const simulatedAddress =
        walletInfo.chainType === 'solana'
          ? `${generateNonce().slice(0, 8)}...${generateNonce().slice(0, 4)}` // Solana-style
          : `0x${generateNonce().slice(0, 8)}...${generateNonce().slice(0, 4)}`; // EVM-style

      const walletData = {
        address: simulatedAddress,
        chainType: walletInfo.chainType,
        walletType: walletType,
      };

      // Save to storage
      await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));

      setState((prev) => ({
        ...prev,
        ...walletData,
        isConnecting: false,
      }));

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
  }, []);

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
        // In production, this would:
        // 1. For EVM: Use signMessage from wallet provider
        // 2. For Solana: Use signMessage from Phantom SDK

        // Simulated signing for development
        // TODO: Replace with actual wallet SDK signing
        await new Promise<void>((resolve) => setTimeout(resolve, 1500));

        // Generate a simulated signature
        const simulatedSignature = `0x${generateNonce()}${generateNonce()}`;

        const signed: SignedData = {
          signature: simulatedSignature,
          message: message,
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
    [state.address, state.walletType]
  );

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      // Clear storage
      await AsyncStorage.multiRemove([WALLET_STORAGE_KEY, AUTH_STORAGE_KEY]);

      // Reset state
      setState(initialState);
      setSignedData(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, []);

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
