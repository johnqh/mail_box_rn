import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountsStackParamList } from '../../navigation/types';

type SettingsListScreenProps = NativeStackScreenProps<AccountsStackParamList, 'SettingsList'>;

const settingsItems = [
  { id: 'general', icon: '⚙️', titleKey: 'settings.general' },
  { id: 'appearance', icon: '🎨', titleKey: 'settings.appearance' },
  { id: 'language', icon: '🌐', titleKey: 'settings.language' },
  { id: 'notifications', icon: '🔔', titleKey: 'settings.notifications' },
  { id: 'security', icon: '🔒', titleKey: 'settings.security' },
  { id: 'about', icon: 'ℹ️', titleKey: 'settings.about' },
];

export const SettingsListScreen: React.FC<SettingsListScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation('common');
  const { accountId: _accountId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {settingsItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.settingItem}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <Text style={styles.settingTitle}>{t(item.titleKey)}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    color: '#3b82f6',
    fontSize: 16,
    minWidth: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    minWidth: 60,
  },
  content: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  chevron: {
    fontSize: 20,
    color: '#999999',
  },
});

export default SettingsListScreen;
