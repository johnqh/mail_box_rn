import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import type { MainTabParamList, AccountsStackParamList, ComposeStackParamList, SettingsStackParamList } from './types';

// Screens
import EmailAccountsListScreen from '../screens/accounts/EmailAccountsListScreen';
import MailboxesListScreen from '../screens/mailboxes/MailboxesListScreen';
import SettingsListScreen from '../screens/mailboxes/SettingsScreen';
import EmailsListScreen from '../screens/emails/EmailsListScreen';
import EmailDetailScreen from '../screens/emails/EmailDetailScreen';
import ComposeScreen from '../screens/compose/ComposeScreen';

// Create navigators
const Tab = createBottomTabNavigator<MainTabParamList>();
const AccountsStack = createNativeStackNavigator<AccountsStackParamList>();
const ComposeStack = createNativeStackNavigator<ComposeStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

// Tab icon component
const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => (
  <View style={styles.tabIcon}>
    <Text style={[styles.tabIconText, focused && styles.tabIconFocused]}>{name}</Text>
  </View>
);

// Stable tab icon render functions to avoid react/no-unstable-nested-components warning
const renderMailIcon = ({ focused }: { focused: boolean }) => <TabIcon name="📧" focused={focused} />;
const renderComposeIcon = ({ focused }: { focused: boolean }) => <TabIcon name="✏️" focused={focused} />;
const renderSettingsIcon = ({ focused }: { focused: boolean }) => <TabIcon name="⚙️" focused={focused} />;

// Accounts Stack Navigator
const AccountsStackNavigator: React.FC = () => (
  <AccountsStack.Navigator screenOptions={{ headerShown: false }}>
    <AccountsStack.Screen name="EmailAccountsList" component={EmailAccountsListScreen} />
    <AccountsStack.Screen name="MailboxesList" component={MailboxesListScreen} />
    <AccountsStack.Screen name="SettingsList" component={SettingsListScreen} />
    <AccountsStack.Screen name="EmailsList" component={EmailsListScreen} />
    <AccountsStack.Screen name="EmailDetail" component={EmailDetailScreen} />
  </AccountsStack.Navigator>
);

// Compose Stack Navigator
const ComposeStackNavigator: React.FC = () => (
  <ComposeStack.Navigator screenOptions={{ headerShown: false }}>
    <ComposeStack.Screen name="Compose" component={ComposeScreen} />
  </ComposeStack.Navigator>
);

// Settings Stack Navigator (App-level settings)
const AppSettingsScreen: React.FC = () => (
  <View style={styles.placeholder}>
    <Text>App Settings</Text>
  </View>
);

const SettingsStackNavigator: React.FC = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="AppSettings" component={AppSettingsScreen} />
  </SettingsStack.Navigator>
);

// Main Phone Navigator with Bottom Tabs
export const PhoneNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#666666',
      }}
    >
      <Tab.Screen
        name="AccountsTab"
        component={AccountsStackNavigator}
        options={{
          tabBarLabel: 'Mail',
          tabBarIcon: renderMailIcon,
        }}
      />
      <Tab.Screen
        name="ComposeTab"
        component={ComposeStackNavigator}
        options={{
          tabBarLabel: 'Compose',
          tabBarIcon: renderComposeIcon,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: renderSettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 24,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhoneNavigator;
