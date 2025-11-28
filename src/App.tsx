import 'react-native-gesture-handler';
import 'react-native-get-random-values';

import React from 'react';
import { StatusBar, useColorScheme, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider, queryClient } from '@sudobility/lib';
import { WalletConnectModal } from '@walletconnect/modal-react-native';

import { RootNavigator } from './navigation/RootNavigator';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider, WALLETCONNECT_PROJECT_ID, APP_METADATA } from './wallet';
import { initializeDI } from './config/di';

// Initialize dependency injection
initializeDI();

export default function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const navigationRef = useNavigationContainerRef();

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <WalletProvider>
              <AuthProvider>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={isDarkMode ? '#000000' : '#ffffff'}
                />
                <NavigationContainer ref={navigationRef}>
                  <RootNavigator />
                </NavigationContainer>
              </AuthProvider>
            </WalletProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
      {/* WalletConnect Modal - must be outside other providers */}
      <WalletConnectModal
        projectId={WALLETCONNECT_PROJECT_ID}
        providerMetadata={APP_METADATA}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
