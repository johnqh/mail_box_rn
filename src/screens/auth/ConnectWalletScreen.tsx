import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { useWallet, SUPPORTED_WALLETS } from '../../wallet';
import type { WalletType } from '../../wallet';
import { useAuth } from '../../context/AuthContext';
import { useBiometrics, promptEnableBiometrics } from '../../utils/useBiometrics';

type WalletTab = 'ethereum' | 'solana';

/**
 * Connect Wallet Screen
 *
 * Two-step flow:
 * 1. Connect - Select and connect a wallet
 * 2. Sign - Sign a message to verify ownership
 */
export function ConnectWalletScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const [activeTab, setActiveTab] = useState<WalletTab>('ethereum');
  const [error, setError] = useState<string | null>(null);

  const {
    address,
    chainType,
    isConnecting,
    isSigning,
    connect,
    signMessage,
    disconnect,
    getSigningMessage,
    signedData,
    error: walletError,
  } = useWallet();

  const { connect: authConnect, authenticate } = useAuth();
  const biometrics = useBiometrics();

  // Sync wallet error to local error state
  useEffect(() => {
    if (walletError) {
      setError(walletError);
    }
  }, [walletError]);

  // Prompt to enable biometrics when wallet is connected
  useEffect(() => {
    if (address && biometrics.isAvailable && !biometrics.isEnrolled) {
      // Slight delay to let the UI settle
      const timer = setTimeout(() => {
        promptEnableBiometrics(biometrics);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [address, biometrics]);

  // When signed data is available, authenticate
  useEffect(() => {
    if (signedData && address && chainType) {
      authConnect(address, chainType as 'evm' | 'solana');
      authenticate();
    }
  }, [signedData, address, chainType, authConnect, authenticate]);

  const colors = {
    background: isDarkMode ? '#000000' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#8e8e93' : '#6e6e73',
    card: isDarkMode ? '#1c1c1e' : '#f2f2f7',
    border: isDarkMode ? '#38383a' : '#c6c6c8',
    primary: '#007AFF',
    error: '#FF3B30',
  };

  const handleTabChange = useCallback((tab: WalletTab) => {
    ReactNativeHapticFeedback.trigger('impactLight');
    setActiveTab(tab);
    setError(null);
  }, []);

  const handleWalletSelect = useCallback(
    async (walletType: WalletType) => {
      ReactNativeHapticFeedback.trigger('impactMedium');
      setError(null);

      const success = await connect(walletType);
      if (success) {
        ReactNativeHapticFeedback.trigger('notificationSuccess');
      } else {
        ReactNativeHapticFeedback.trigger('notificationError');
      }
    },
    [connect]
  );

  const handleSignMessage = useCallback(async () => {
    ReactNativeHapticFeedback.trigger('impactMedium');
    setError(null);

    // Require biometric authentication if enabled
    if (biometrics.shouldRequireBiometrics()) {
      const authenticated = await biometrics.authenticate(
        'Authenticate to sign the verification message'
      );
      if (!authenticated) {
        // User cancelled or auth failed
        if (biometrics.error) {
          setError(biometrics.error);
        }
        return;
      }
    }

    const message = getSigningMessage();
    const result = await signMessage(message);

    if (result) {
      ReactNativeHapticFeedback.trigger('notificationSuccess');
    } else {
      ReactNativeHapticFeedback.trigger('notificationError');
    }
  }, [signMessage, getSigningMessage, biometrics]);

  const handleReset = useCallback(async () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    await disconnect();
    setError(null);
  }, [disconnect]);

  // Filter wallets by chain type
  const ethereumWallets = SUPPORTED_WALLETS.filter((w) => w.chainType === 'evm');
  const solanaWallets = SUPPORTED_WALLETS.filter((w) => w.chainType === 'solana');

  const renderWalletButton = (
    wallet: (typeof SUPPORTED_WALLETS)[0],
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={wallet.type}
      testID={`wallet-button-${wallet.type}`}
      accessibilityRole="button"
      accessibilityLabel={`Connect with ${wallet.name}`}
      accessibilityHint={`Opens ${wallet.name} to connect your wallet`}
      accessibilityState={{ disabled: isConnecting }}
      style={[styles.walletButton, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={isConnecting}
      activeOpacity={0.7}
    >
      <Text style={styles.walletIcon} accessibilityElementsHidden>{wallet.icon}</Text>
      <Text style={[styles.walletName, { color: colors.text }]}>{wallet.name}</Text>
      {isConnecting && <ActivityIndicator size="small" color={colors.primary} accessibilityLabel="Connecting" />}
    </TouchableOpacity>
  );

  // Connect Step
  const renderConnectStep = () => (
    <>
      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          testID="tab-ethereum"
          accessibilityRole="tab"
          accessibilityLabel="Ethereum wallets"
          accessibilityState={{ selected: activeTab === 'ethereum' }}
          accessibilityHint="Shows Ethereum wallet options"
          style={[
            styles.tab,
            activeTab === 'ethereum' && {
              backgroundColor: colors.background,
            },
          ]}
          onPress={() => handleTabChange('ethereum')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'ethereum' ? colors.primary : colors.textSecondary },
            ]}
          >
            Ethereum
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="tab-solana"
          accessibilityRole="tab"
          accessibilityLabel="Solana wallets"
          accessibilityState={{ selected: activeTab === 'solana' }}
          accessibilityHint="Shows Solana wallet options"
          style={[
            styles.tab,
            activeTab === 'solana' && {
              backgroundColor: colors.background,
            },
          ]}
          onPress={() => handleTabChange('solana')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'solana' ? colors.primary : colors.textSecondary },
            ]}
          >
            Solana
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wallet Options */}
      <View style={styles.walletList}>
        {activeTab === 'ethereum'
          ? ethereumWallets.map((wallet) =>
              renderWalletButton(wallet, () => handleWalletSelect(wallet.type))
            )
          : solanaWallets.map((wallet) =>
              renderWalletButton(wallet, () => handleWalletSelect(wallet.type))
            )}
      </View>
    </>
  );

  // Sign Step
  const renderSignStep = () => (
    <View style={styles.signContainer}>
      <View
        testID="connected-address-card"
        style={[styles.addressCard, { backgroundColor: colors.card }]}
        accessibilityRole="text"
        accessibilityLabel={`Connected wallet address: ${address}`}
      >
        <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>
          Connected Wallet
        </Text>
        <Text testID="connected-address" style={[styles.addressValue, { color: colors.text }]}>{address}</Text>
        <View
          style={[
            styles.chainBadge,
            chainType === 'evm' ? styles.chainBadgeEthereum : styles.chainBadgeSolana,
          ]}
        >
          <Text style={styles.chainBadgeText}>
            {chainType === 'evm' ? 'Ethereum' : 'Solana'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        testID="sign-button"
        accessibilityRole="button"
        accessibilityLabel={isSigning ? 'Signing message' : 'Sign message to verify'}
        accessibilityHint="Signs a message to verify wallet ownership"
        accessibilityState={{ disabled: isSigning, busy: isSigning }}
        style={[styles.signButton, { backgroundColor: colors.primary }]}
        onPress={handleSignMessage}
        disabled={isSigning}
        activeOpacity={0.8}
      >
        {isSigning ? (
          <ActivityIndicator color="#ffffff" accessibilityLabel="Signing in progress" />
        ) : (
          <Text style={styles.signButtonText}>Sign Message to Verify</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        testID="reset-wallet-button"
        accessibilityRole="button"
        accessibilityLabel="Use different wallet"
        accessibilityHint="Disconnects current wallet and returns to wallet selection"
        style={styles.resetButton}
        onPress={handleReset}
        activeOpacity={0.7}
      >
        <Text style={[styles.resetButtonText, { color: colors.primary }]}>
          Use Different Wallet
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isTablet && styles.contentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {address ? 'Verify Your Wallet' : 'Connect Your Wallet'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {address
              ? 'Sign a message to verify you own this wallet'
              : 'Choose a wallet to connect to Signa Email'}
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: `${colors.error}20` }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {/* Content */}
        {address ? renderSignStep() : renderConnectStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  contentTablet: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  walletList: {
    width: '100%',
    gap: 12,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  walletIcon: {
    fontSize: 24,
  },
  walletName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
  },
  signContainer: {
    width: '100%',
    alignItems: 'center',
  },
  addressCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  addressValue: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Menlo',
    marginBottom: 12,
  },
  chainBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chainBadgeEthereum: {
    backgroundColor: '#627EEA',
  },
  chainBadgeSolana: {
    backgroundColor: '#9945FF',
  },
  chainBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  signButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  signButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  resetButton: {
    padding: 12,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
