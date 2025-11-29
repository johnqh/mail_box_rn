/**
 * 0xMail React Native App
 * Decentralized email powered by blockchain
 */

import 'react-native-get-random-values';
import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { initializeAllServices } from './src/di/initializeServices';
import { ServiceProvider } from './src/di/ServiceContext';
import { initializeI18n } from './src/i18n';
import { RootNavigator } from './src/navigation';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize services
        initializeAllServices();

        // Initialize i18n
        await initializeI18n();

        setIsReady(true);
      } catch (error) {
        console.error('Initialization error:', error);
        // Still set ready to show app even if some initialization fails
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loadingContainer}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ServiceProvider>
            <NavigationContainer>
              <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
              <RootNavigator />
            </NavigationContainer>
          </ServiceProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default App;
