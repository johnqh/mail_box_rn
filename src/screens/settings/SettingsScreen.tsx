import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingRowProps {
  icon: string;
  title: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
}

function SettingRow({
  icon,
  title,
  description,
  onPress,
  rightElement,
  showChevron = true,
  destructive = false,
}: SettingRowProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const colors = {
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#8e8e93' : '#6e6e73',
    border: isDarkMode ? '#38383a' : '#e5e5ea',
    destructive: '#FF3B30',
  };

  const textColor = destructive ? colors.destructive : colors.text;

  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {rightElement}
      {showChevron && onPress && (
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      )}
    </TouchableOpacity>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#8e8e93' : '#6e6e73';
  const bgColor = isDarkMode ? '#1c1c1e' : '#f2f2f7';

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: bgColor }]}>
        {children}
      </View>
    </View>
  );
}

export function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const isDarkMode = useColorScheme() === 'dark';
  const { address, chainType, disconnect } = useAuth();
  const { isDark, setThemeMode } = useTheme();

  const colors = {
    background: isDarkMode ? '#000000' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#8e8e93' : '#6e6e73',
    primary: '#007AFF',
    border: isDarkMode ? '#38383a' : '#c6c6c8',
  };

  const handleThemeToggle = useCallback(
    (value: boolean) => {
      setThemeMode(value ? 'dark' : 'light');
    },
    [setThemeMode]
  );

  const handleDisconnect = useCallback(() => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            disconnect();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  }, [disconnect, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const formatAddress = (addr: string | null): string => {
    if (!addr) return 'Not connected';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <SettingSection title="ACCOUNT">
          <SettingRow
            icon="👛"
            title="Wallet"
            description={formatAddress(address)}
            showChevron={false}
          />
          <SettingRow
            icon="⛓️"
            title="Network"
            description={chainType === 'evm' ? 'Ethereum' : chainType === 'solana' ? 'Solana' : 'Not connected'}
            showChevron={false}
          />
        </SettingSection>

        {/* Appearance Section */}
        <SettingSection title="APPEARANCE">
          <SettingRow
            icon="🌙"
            title="Dark Mode"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor="#ffffff"
              />
            }
            showChevron={false}
          />
        </SettingSection>

        {/* About Section */}
        <SettingSection title="ABOUT">
          <SettingRow
            icon="ℹ️"
            title="Version"
            description="0.1.0"
            showChevron={false}
          />
          <SettingRow
            icon="📄"
            title="Terms of Service"
            onPress={() => {
              // TODO: Open terms URL
            }}
          />
          <SettingRow
            icon="🔒"
            title="Privacy Policy"
            onPress={() => {
              // TODO: Open privacy URL
            }}
          />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="DANGER ZONE">
          <SettingRow
            icon="🚪"
            title="Disconnect Wallet"
            onPress={handleDisconnect}
            showChevron={false}
            destructive
          />
        </SettingSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 17,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    marginLeft: 8,
  },
});
