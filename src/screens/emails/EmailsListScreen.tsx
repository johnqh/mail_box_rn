import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { EmailsListScreenProps } from '../../navigation/types';

// Extracted to avoid react/no-unstable-nested-components warning
const ItemSeparator = () => <View style={styles.separator} />;

// Mock data - will be replaced with @sudobility/lib hooks
const mockEmails = [
  {
    id: '1',
    from: 'alice.eth@0xmail.box',
    subject: 'Welcome to 0xMail!',
    preview: 'Thanks for joining the decentralized email revolution...',
    date: '2h ago',
    unread: true,
  },
  {
    id: '2',
    from: 'bob@0xmail.box',
    subject: 'NFT Transfer Notification',
    preview: 'Your NFT has been successfully transferred to...',
    date: '5h ago',
    unread: true,
  },
  {
    id: '3',
    from: 'protocol@0xmail.box',
    subject: 'Weekly Digest',
    preview: 'Here is your weekly summary of activity...',
    date: '1d ago',
    unread: false,
  },
];

export const EmailsListScreen: React.FC<EmailsListScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation('common');
  const { accountId, mailboxId, mailboxName } = route.params;

  const renderEmail = ({ item }: { item: typeof mockEmails[0] }) => (
    <TouchableOpacity
      style={[styles.emailItem, item.unread && styles.emailItemUnread]}
      onPress={() => navigation.navigate('EmailDetail', {
        accountId,
        mailboxId,
        emailId: item.id,
      })}
    >
      <View style={styles.emailHeader}>
        <Text style={[styles.emailFrom, item.unread && styles.textBold]}>
          {item.from}
        </Text>
        <Text style={styles.emailDate}>{item.date}</Text>
      </View>
      <Text style={[styles.emailSubject, item.unread && styles.textBold]}>
        {item.subject}
      </Text>
      <Text style={styles.emailPreview} numberOfLines={1}>
        {item.preview}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{mailboxName}</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={mockEmails}
        keyExtractor={(item) => item.id}
        renderItem={renderEmail}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('mail.noEmails')}</Text>
          </View>
        }
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
  listContent: {
    flexGrow: 1,
  },
  emailItem: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  emailItemUnread: {
    backgroundColor: '#f0f7ff',
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  emailFrom: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  emailDate: {
    fontSize: 12,
    color: '#999999',
  },
  emailSubject: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  emailPreview: {
    fontSize: 14,
    color: '#666666',
  },
  textBold: {
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default EmailsListScreen;
