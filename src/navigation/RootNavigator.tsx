import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConnectWalletScreen } from '../screens/auth/ConnectWalletScreen';
import { MailNavigator } from './MailNavigator';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!isAuthenticated ? (
        // Auth flow
        <Stack.Screen
          name="ConnectWallet"
          component={ConnectWalletScreen}
          options={{
            title: 'Connect Wallet',
          }}
        />
      ) : (
        // Main app
        <Stack.Screen
          name="Main"
          component={MailNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}
