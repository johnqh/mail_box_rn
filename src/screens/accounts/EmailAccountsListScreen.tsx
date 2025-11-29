import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { EmailAccountsListScreenProps } from '../../navigation/types';

// Mock data - will be replaced with @sudobility/lib hooks
const mockAccounts = [
  { id: '1', address: '0x1234...5678@0xmail.box', type: 'wallet' },
  { id: '2', address: 'john.eth@0xmail.box', type: 'ens' },
];

// Extracted to avoid react/no-unstable-nested-components warning
const ItemSeparator = () => <View style={styles.separator} />;

export const EmailAccountsListScreen: React.FC<EmailAccountsListScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('common');

  const renderAccount = ({ item }: { item: typeof mockAccounts[0] }) => (
    <TouchableOpacity
      style={styles.accountItem}
      onPress={() => navigation.navigate('MailboxesList', { accountId: item.id })}
    >
      <View style={styles.accountIcon}>
        <Text style={styles.accountIconText}>
          {item.type === 'ens' ? 'ENS' : 'W'}
        </Text>
      </View>
      <View style={styles.accountInfo}>
        <Text style={styles.accountAddress}>{item.address}</Text>
        <Text style={styles.accountType}>
          {item.type === 'ens' ? 'ENS Domain' : 'Wallet Address'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('accounts.title')}</Text>
      </View>

      <FlatList
        data={mockAccounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccount}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('accounts.noAccounts')}</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  listContent: {
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountInfo: {
    flex: 1,
  },
  accountAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#666666',
  },
  separator: {
    height: 12,
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

export default EmailAccountsListScreen;
