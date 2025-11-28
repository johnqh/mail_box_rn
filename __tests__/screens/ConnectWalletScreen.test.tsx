/**
 * Tests for ConnectWalletScreen
 *
 * Tests the wallet connection and signing flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock haptic feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock wallet context
const mockConnect = jest.fn();
const mockSignMessage = jest.fn();
const mockDisconnect = jest.fn();
const mockGetSigningMessage = jest.fn(() => 'Sign this message: test-nonce');

let mockWalletState = {
  address: null as string | null,
  chainType: null as string | null,
  isConnecting: false,
  isSigning: false,
  signedData: null,
  error: null as string | null,
};

jest.mock('../../src/wallet', () => ({
  useWallet: () => ({
    ...mockWalletState,
    connect: mockConnect,
    signMessage: mockSignMessage,
    disconnect: mockDisconnect,
    getSigningMessage: mockGetSigningMessage,
  }),
  SUPPORTED_WALLETS: [
    { type: 'walletconnect', name: 'WalletConnect', icon: '🔗', chainType: 'evm' },
    { type: 'metamask', name: 'MetaMask', icon: '🦊', chainType: 'evm' },
    { type: 'phantom', name: 'Phantom', icon: '👻', chainType: 'solana' },
    { type: 'solflare', name: 'Solflare', icon: '🔥', chainType: 'solana' },
  ],
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock auth context
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    connect: jest.fn(),
    authenticate: jest.fn(),
    isAuthenticated: false,
  }),
}));

// Mock biometrics
jest.mock('../../src/utils/useBiometrics', () => ({
  useBiometrics: () => ({
    isAvailable: false,
    biometryType: null,
    isEnrolled: false,
    isAuthenticating: false,
    error: null,
    authenticate: jest.fn(() => Promise.resolve(true)),
    shouldRequireBiometrics: jest.fn(() => false),
    createKeys: jest.fn(),
    deleteKeys: jest.fn(),
  }),
  promptEnableBiometrics: jest.fn(),
}));

import { ConnectWalletScreen } from '../../src/screens/auth/ConnectWalletScreen';

describe('ConnectWalletScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWalletState = {
      address: null,
      chainType: null,
      isConnecting: false,
      isSigning: false,
      signedData: null,
      error: null,
    };
  });

  describe('Connect Step', () => {
    it('should render the connect wallet title', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('Connect Your Wallet')).toBeTruthy();
    });

    it('should render Ethereum tab by default', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('Ethereum')).toBeTruthy();
      expect(getByText('Solana')).toBeTruthy();
    });

    it('should show EVM wallets when Ethereum tab is active', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('WalletConnect')).toBeTruthy();
      expect(getByText('MetaMask')).toBeTruthy();
    });

    it('should switch to Solana wallets when Solana tab is pressed', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      fireEvent.press(getByText('Solana'));

      expect(getByText('Phantom')).toBeTruthy();
      expect(getByText('Solflare')).toBeTruthy();
    });

    it('should call connect when wallet button is pressed', async () => {
      mockConnect.mockResolvedValue(true);
      const { getByText } = render(<ConnectWalletScreen />);

      fireEvent.press(getByText('WalletConnect'));

      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalledWith('walletconnect');
      });
    });
  });

  describe('Sign Step', () => {
    beforeEach(() => {
      mockWalletState = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainType: 'evm',
        isConnecting: false,
        isSigning: false,
        signedData: null,
        error: null,
      };
    });

    it('should show verify wallet title when connected', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('Verify Your Wallet')).toBeTruthy();
    });

    it('should display connected address', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('0x1234567890abcdef1234567890abcdef12345678')).toBeTruthy();
    });

    it('should display chain badge for EVM', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('Ethereum')).toBeTruthy();
    });

    it('should display chain badge for Solana', () => {
      mockWalletState.chainType = 'solana';
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('Solana')).toBeTruthy();
    });

    it('should show sign button', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('Sign Message to Verify')).toBeTruthy();
    });

    it('should call signMessage when sign button is pressed', async () => {
      mockSignMessage.mockResolvedValue({ signature: '0xabc' });
      const { getByText } = render(<ConnectWalletScreen />);

      fireEvent.press(getByText('Sign Message to Verify'));

      await waitFor(() => {
        expect(mockGetSigningMessage).toHaveBeenCalled();
        expect(mockSignMessage).toHaveBeenCalled();
      });
    });

    it('should show different wallet button', () => {
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('Use Different Wallet')).toBeTruthy();
    });

    it('should call disconnect when different wallet is pressed', async () => {
      const { getByText } = render(<ConnectWalletScreen />);

      fireEvent.press(getByText('Use Different Wallet'));

      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled();
      });
    });
  });

  describe('Error States', () => {
    it('should display error message when there is an error', () => {
      mockWalletState.error = 'Connection failed';
      const { getByText } = render(<ConnectWalletScreen />);

      expect(getByText('Connection failed')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should show loading when connecting', () => {
      mockWalletState.isConnecting = true;
      const { UNSAFE_getAllByType } = render(<ConnectWalletScreen />);

      // ActivityIndicator should be present
      const activityIndicators = UNSAFE_getAllByType('ActivityIndicator' as any);
      expect(activityIndicators.length).toBeGreaterThan(0);
    });

    it('should show loading when signing', () => {
      mockWalletState = {
        ...mockWalletState,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainType: 'evm',
        isSigning: true,
      };
      const { UNSAFE_getAllByType } = render(<ConnectWalletScreen />);

      const activityIndicators = UNSAFE_getAllByType('ActivityIndicator' as any);
      expect(activityIndicators.length).toBeGreaterThan(0);
    });
  });
});
