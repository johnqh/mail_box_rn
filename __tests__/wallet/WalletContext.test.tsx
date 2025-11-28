/**
 * Tests for WalletContext
 *
 * Tests wallet connection state management
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { WalletProvider, useWallet, SUPPORTED_WALLETS } from '../../src/wallet';

// Wrapper component for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WalletProvider>{children}</WalletProvider>
);

describe('WalletContext', () => {
  describe('useWallet hook', () => {
    it('should provide initial disconnected state', () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(result.current.address).toBeNull();
      expect(result.current.chainType).toBeNull();
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.isSigning).toBe(false);
      expect(result.current.signedData).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should provide connect function', () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(typeof result.current.connect).toBe('function');
    });

    it('should provide disconnect function', () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(typeof result.current.disconnect).toBe('function');
    });

    it('should provide signMessage function', () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(typeof result.current.signMessage).toBe('function');
    });

    it('should provide getSigningMessage function', () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(typeof result.current.getSigningMessage).toBe('function');
    });

    it('should return signing message with nonce', () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      const message = result.current.getSigningMessage();

      expect(message).toContain('Signa Email');
      expect(message).toContain('Nonce:');
    });
  });

  describe('SUPPORTED_WALLETS', () => {
    it('should include EVM wallets', () => {
      const evmWallets = SUPPORTED_WALLETS.filter((w) => w.chainType === 'evm');
      expect(evmWallets.length).toBeGreaterThan(0);
    });

    it('should include Solana wallets', () => {
      const solanaWallets = SUPPORTED_WALLETS.filter((w) => w.chainType === 'solana');
      expect(solanaWallets.length).toBeGreaterThan(0);
    });

    it('should have proper wallet structure', () => {
      SUPPORTED_WALLETS.forEach((wallet) => {
        expect(wallet).toHaveProperty('type');
        expect(wallet).toHaveProperty('name');
        expect(wallet).toHaveProperty('icon');
        expect(wallet).toHaveProperty('chainType');
        expect(['evm', 'solana']).toContain(wallet.chainType);
      });
    });

    it('should include WalletConnect for EVM', () => {
      const wcWallet = SUPPORTED_WALLETS.find((w) => w.type === 'walletconnect');
      expect(wcWallet).toBeDefined();
      expect(wcWallet?.chainType).toBe('evm');
    });

    it('should include Phantom for Solana', () => {
      const phantomWallet = SUPPORTED_WALLETS.find((w) => w.type === 'phantom');
      expect(phantomWallet).toBeDefined();
      expect(phantomWallet?.chainType).toBe('solana');
    });
  });
});

describe('WalletContext disconnect', () => {
  it('should reset state on disconnect', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.address).toBeNull();
    expect(result.current.chainType).toBeNull();
    expect(result.current.signedData).toBeNull();
  });
});
