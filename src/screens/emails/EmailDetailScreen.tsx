import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { EmailDetailScreenProps } from '../../navigation/types';

// Mock data - will be replaced with @sudobility/lib hooks
const mockEmail = {
  id: '1',
  from: 'alice.eth@0xmail.box',
  to: 'user@0xmail.box',
  subject: 'Welcome to 0xMail!',
  date: 'Nov 28, 2024 at 10:30 AM',
  body: `Hi there,

Welcome to 0xMail, the decentralized email platform powered by blockchain technology!

With 0xMail, you can:
- Send and receive emails using your wallet address or ENS name
- Own your email data with decentralized storage
- Enjoy enhanced privacy and security
- Connect with the Web3 community

If you have any questions, feel free to reply to this email.

Best regards,
The 0xMail Team`,
};

export const EmailDetailScreen: React.FC<EmailDetailScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation('common');
  const { emailId: _emailId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>{t('mail.reply')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>{t('mail.forward')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={[styles.actionText, styles.deleteText]}>{t('mail.delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subject}>{mockEmail.subject}</Text>

        <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <Text style={styles.label}>From:</Text>
            <Text style={styles.value}>{mockEmail.from}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.label}>To:</Text>
            <Text style={styles.value}>{mockEmail.to}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{mockEmail.date}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.body}>{mockEmail.body}</Text>
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
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  deleteText: {
    color: '#ef4444',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subject: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  metadata: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    width: 50,
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  body: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 24,
  },
});

export default EmailDetailScreen;
