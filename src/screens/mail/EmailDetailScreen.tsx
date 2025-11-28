import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MailStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MailStackParamList, 'EmailDetail'>;

// Mock email data - will be fetched from API
const MOCK_EMAIL = {
  id: '1',
  from: 'vitalik.eth',
  to: 'you@0xmail.box',
  subject: 'Welcome to Web3 Email',
  date: 'December 27, 2024 at 10:30 AM',
  body: `Hello!

Welcome to the future of email. Web3 Email brings the power of decentralized identity to your inbox.

With your wallet-based email address, you can:
• Send and receive emails using your ENS or SNS name
• Verify sender identity through blockchain signatures
• Own your data with decentralized storage options
• Connect with the Web3 community seamlessly

We're excited to have you on board. If you have any questions, feel free to reach out to our team.

Best regards,
The Web3 Email Team`,
  isStarred: true,
  attachments: [],
};

export function EmailDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { emailId } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  // TODO: Fetch email by ID from API
  const email = MOCK_EMAIL;

  const colors = {
    background: isDarkMode ? '#000000' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#8e8e93' : '#6e6e73',
    card: isDarkMode ? '#1c1c1e' : '#f2f2f7',
    border: isDarkMode ? '#38383a' : '#e5e5ea',
    primary: '#007AFF',
  };

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleReply = useCallback(() => {
    navigation.navigate('Compose', {
      replyTo: emailId,
      to: email.from,
      subject: `Re: ${email.subject}`,
    });
  }, [navigation, emailId, email.from, email.subject]);

  const handleForward = useCallback(() => {
    navigation.navigate('Compose', {
      forward: emailId,
      subject: `Fwd: ${email.subject}`,
      body: `\n\n---------- Forwarded message ---------\nFrom: ${email.from}\nDate: ${email.date}\nSubject: ${email.subject}\n\n${email.body}`,
    });
  }, [navigation, emailId, email]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${email.subject}\n\nFrom: ${email.from}\n\n${email.body}`,
        title: email.subject,
      });
    } catch {
      // Handle share error silently
    }
  }, [email]);

  const handleDelete = useCallback(() => {
    // TODO: Implement delete
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Text style={styles.actionIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Email Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.scrollContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subject */}
        <Text style={[styles.subject, { color: colors.text }]}>
          {email.subject}
        </Text>

        {/* Sender Info */}
        <View style={[styles.senderCard, { backgroundColor: colors.card }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {email.from.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.senderInfo}>
            <Text style={[styles.fromText, { color: colors.text }]}>
              {email.from}
            </Text>
            <Text style={[styles.toText, { color: colors.textSecondary }]}>
              to {email.to}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {email.date}
          </Text>
        </View>

        {/* Body */}
        <View style={styles.bodyContainer}>
          <Text style={[styles.bodyText, { color: colors.text }]}>
            {email.body}
          </Text>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={[styles.actionBar, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.replyButton, { backgroundColor: colors.primary }]}
          onPress={handleReply}
        >
          <Text style={styles.replyButtonText}>↩️ Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.forwardButton, { backgroundColor: colors.card }]}
          onPress={handleForward}
        >
          <Text style={[styles.forwardButtonText, { color: colors.text }]}>
            ↪️ Forward
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentTablet: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  subject: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 30,
  },
  senderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  senderInfo: {
    flex: 1,
  },
  fromText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toText: {
    fontSize: 13,
  },
  dateText: {
    fontSize: 12,
  },
  bodyContainer: {
    paddingBottom: 100,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 34, // Account for home indicator
    borderTopWidth: 1,
    gap: 12,
  },
  replyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  replyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  forwardButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  forwardButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
