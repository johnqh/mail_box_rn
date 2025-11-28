import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

import { MailListScreen, EmailDetailScreen, ComposeScreen } from '../screens/mail';
import type { MailStackParamList, DrawerParamList } from './types';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<MailStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// Mail Stack Navigator (for each mailbox)
function MailStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MailList" component={MailListScreen} />
      <Stack.Screen name="EmailDetail" component={EmailDetailScreen} />
      <Stack.Screen
        name="Compose"
        component={ComposeScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

// Custom Drawer Content
function DrawerContent({ navigation }: DrawerContentComponentProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const { address, chainType, disconnect } = useAuth();

  const colors = {
    background: isDarkMode ? '#1c1c1e' : '#f2f2f7',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#8e8e93' : '#6e6e73',
    primary: '#007AFF',
    border: isDarkMode ? '#38383a' : '#e5e5ea',
  };

  const menuItems = [
    { key: 'Inbox', label: 'Inbox', icon: '📥', badge: 3 },
    { key: 'Sent', label: 'Sent', icon: '📤', badge: 0 },
    { key: 'Drafts', label: 'Drafts', icon: '📝', badge: 1 },
    { key: 'Starred', label: 'Starred', icon: '⭐', badge: 0 },
    { key: 'Trash', label: 'Trash', icon: '🗑️', badge: 0 },
  ];

  const handleNavigate = (key: keyof DrawerParamList) => {
    navigation.navigate(key);
  };

  const handleLogout = () => {
    disconnect();
  };

  return (
    <View style={[styles.drawerContainer, { backgroundColor: colors.background }]}>
      {/* User Info */}
      <View style={[styles.userSection, { borderBottomColor: colors.border }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {address ? address.slice(2, 4).toUpperCase() : '??'}
          </Text>
        </View>
        <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={1}>
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
        </Text>
        <View style={[styles.chainBadge, chainType === 'evm' ? styles.chainBadgeEvm : styles.chainBadgeSolana]}>
          <Text style={styles.chainBadgeText}>
            {chainType === 'evm' ? 'Ethereum' : 'Solana'}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={() => handleNavigate(item.key as keyof DrawerParamList)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            {item.badge > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings & Logout */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('Settings')}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={[styles.menuLabel, { color: colors.text }]}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuLabel, styles.disconnectText]}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Placeholder Settings Screen
function SettingsScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = {
    background: isDarkMode ? '#000000' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
  };

  return (
    <View style={[styles.settingsContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.settingsTitle, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.settingsText, { color: colors.text }]}>
        Coming soon...
      </Text>
    </View>
  );
}

// Main Mail Navigator with Drawer
export function MailNavigator(): React.JSX.Element {
  return (
    <Drawer.Navigator
      drawerContent={DrawerContent}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="Inbox" component={MailStackNavigator} />
      <Drawer.Screen name="Sent" component={MailStackNavigator} />
      <Drawer.Screen name="Drafts" component={MailStackNavigator} />
      <Drawer.Screen name="Starred" component={MailStackNavigator} />
      <Drawer.Screen name="Trash" component={MailStackNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 60,
  },
  userSection: {
    padding: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Menlo',
    marginBottom: 8,
  },
  chainBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chainBadgeEvm: {
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
  menuSection: {
    flex: 1,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    flex: 1,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  disconnectText: {
    color: '#FF3B30',
  },
  settingsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingsText: {
    fontSize: 16,
  },
});
