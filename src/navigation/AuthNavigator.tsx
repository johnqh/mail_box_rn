import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import LandingScreen from '../screens/auth/LandingScreen';
import ConnectWalletScreen from '../screens/auth/ConnectWalletScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="ConnectWallet" component={ConnectWalletScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
