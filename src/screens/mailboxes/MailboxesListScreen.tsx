import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { MailboxesListScreenProps } from '../../navigation/types';

// Mock data - will be replaced with @sudobility/lib hooks
const mockMailboxes = [
  { id: 'inbox', name: 'Inbox', unread: 5, icon: '📥' },
  { id: 'sent', name: 'Sent', unread: 0, icon: '📤' },
  { id: 'drafts', name: 'Drafts', unread: 2, icon: '📝' },
  { id: 'spam', name: 'Spam', unread: 0, icon: '🚫' },
  { id: 'trash', name: 'Trash', unread: 0, icon: '🗑️' },
];

export const MailboxesListScreen: React.FC<MailboxesListScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation('common');
  const { accountId } = route.params;

  const renderMailbox = ({ item }: { item: typeof mockMailboxes[0] }) => (
    <TouchableOpacity
      style={styles.mailboxItem}
      onPress={() => navigation.navigate('EmailsList', {
        accountId,
        mailboxId: item.id,
        mailboxName: item.name,
      })}
    >
      <Text style={styles.mailboxIcon}>{item.icon}</Text>
      <Text style={styles.mailboxName}>{item.name}</Text>
      {item.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('mail.inbox')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsList', { accountId })}>
          <Text style={styles.settingsButton}>{t('settings.title')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockMailboxes}
        keyExtractor={(item) => item.id}
        renderItem={renderMailbox}
        contentContainerStyle={styles.listContent}
      />
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
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  settingsButton: {
    color: '#3b82f6',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  mailboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mailboxIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  mailboxName: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MailboxesListScreen;
