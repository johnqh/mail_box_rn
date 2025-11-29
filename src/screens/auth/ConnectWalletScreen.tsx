import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { ConnectWalletScreenProps } from '../../navigation/types';

export const ConnectWalletScreen: React.FC<ConnectWalletScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('common');

  const handleConnectEVM = () => {
    // TODO: Implement EVM wallet connection via Reown AppKit
    console.log('Connect EVM wallet');
  };

  const handleConnectSolana = () => {
    // TODO: Implement Solana wallet connection via Mobile Wallet Adapter
    console.log('Connect Solana wallet');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('wallet.selectWallet')}</Text>
        </View>

        <View style={styles.walletOptions}>
          <TouchableOpacity
            style={styles.walletButton}
            onPress={handleConnectEVM}
          >
            <View style={styles.walletIcon}>
              <Text style={styles.walletIconText}>ETH</Text>
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletTitle}>{t('wallet.connectEVM')}</Text>
              <Text style={styles.walletDescription}>
                MetaMask, Rainbow, Coinbase Wallet, etc.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.walletButton}
            onPress={handleConnectSolana}
          >
            <View style={[styles.walletIcon, styles.solanaIcon]}>
              <Text style={styles.walletIconText}>SOL</Text>
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletTitle}>{t('wallet.connectSolana')}</Text>
              <Text style={styles.walletDescription}>
                Phantom, Solflare, etc.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By connecting, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 16,
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  walletOptions: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  walletIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#627eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  solanaIcon: {
    backgroundColor: '#9945ff',
  },
  walletIconText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  walletDescription: {
    fontSize: 14,
    color: '#666666',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default ConnectWalletScreen;
