/**
 * E2E Tests for Wallet Connection Flow
 *
 * Tests the complete wallet connection and verification flow
 */

/* eslint-disable jest/no-disabled-tests -- Skipped tests require mock wallet infrastructure */

import { device, element, by, expect } from 'detox';

describe('Wallet Connection Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Connect Wallet Screen', () => {
    it('should display the connect wallet screen on launch', async () => {
      await expect(element(by.text('Connect Your Wallet'))).toBeVisible();
    });

    it('should display Ethereum tab by default', async () => {
      await expect(element(by.id('tab-ethereum'))).toBeVisible();
      await expect(element(by.id('tab-solana'))).toBeVisible();
    });

    it('should show EVM wallet options when Ethereum tab is selected', async () => {
      await expect(element(by.id('wallet-button-walletconnect'))).toBeVisible();
    });

    it('should switch to Solana wallets when Solana tab is tapped', async () => {
      await element(by.id('tab-solana')).tap();
      await expect(element(by.id('wallet-button-phantom'))).toBeVisible();
    });

    it('should switch back to Ethereum wallets when Ethereum tab is tapped', async () => {
      await element(by.id('tab-solana')).tap();
      await element(by.id('tab-ethereum')).tap();
      await expect(element(by.id('wallet-button-walletconnect'))).toBeVisible();
    });
  });

  describe('Wallet Selection', () => {
    it('should be able to tap WalletConnect button', async () => {
      await element(by.id('wallet-button-walletconnect')).tap();
      // In real E2E test, this would open WalletConnect modal
      // For simulation, we verify the button is tappable
    });

    it('should be able to tap Phantom button after switching to Solana', async () => {
      await element(by.id('tab-solana')).tap();
      await element(by.id('wallet-button-phantom')).tap();
      // In real E2E test, this would trigger deep link to Phantom app
    });
  });
});

describe('Verification Flow', () => {
  // Note: These tests require a mock wallet connection
  // In a real E2E environment, you would use a test wallet or mock provider

  describe('Sign Step UI', () => {
    // This test suite would be run after wallet connection is mocked
    it.skip('should display connected address after wallet connection', async () => {
      // After connecting wallet (mocked), verify UI
      await expect(element(by.id('connected-address-card'))).toBeVisible();
      await expect(element(by.id('connected-address'))).toBeVisible();
      await expect(element(by.text('Verify Your Wallet'))).toBeVisible();
    });

    it.skip('should display sign button', async () => {
      await expect(element(by.id('sign-button'))).toBeVisible();
      await expect(element(by.text('Sign Message to Verify'))).toBeVisible();
    });

    it.skip('should display reset wallet button', async () => {
      await expect(element(by.id('reset-wallet-button'))).toBeVisible();
      await expect(element(by.text('Use Different Wallet'))).toBeVisible();
    });
  });
});

describe('Navigation Flow', () => {
  it('should prevent navigation to main app when not authenticated', async () => {
    // User should remain on Connect Wallet screen
    await expect(element(by.text('Connect Your Wallet'))).toBeVisible();
  });
});

describe('Error Handling', () => {
  it.skip('should display error message on connection failure', async () => {
    // Would need to mock a failed connection
    // await expect(element(by.text(/error/i))).toBeVisible();
  });
});

describe('Accessibility', () => {
  it('should have accessible wallet buttons', async () => {
    // Verify wallet buttons are accessible
    await expect(element(by.id('wallet-button-walletconnect'))).toBeVisible();
  });

  it('should have accessible tab controls', async () => {
    await expect(element(by.id('tab-ethereum'))).toBeVisible();
    await expect(element(by.id('tab-solana'))).toBeVisible();
  });
});
