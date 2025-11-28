import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';

import type { MailStackParamList, DrawerParamList } from '../../navigation/types';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MailStackParamList, 'MailList'>,
  DrawerNavigationProp<DrawerParamList>
>;

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
}

// Mock data for development
const MOCK_EMAILS: Email[] = [
  {
    id: '1',
    from: 'vitalik.eth',
    subject: 'Welcome to Web3 Email',
    preview: 'Thanks for joining the decentralized email revolution...',
    date: '10:30 AM',
    isRead: false,
    isStarred: true,
  },
  {
    id: '2',
    from: 'team@0xmail.box',
    subject: 'Getting Started Guide',
    preview: 'Here are some tips to help you get the most out of your new email...',
    date: 'Yesterday',
    isRead: true,
    isStarred: false,
  },
  {
    id: '3',
    from: 'alice.sol',
    subject: 'Cross-chain messaging test',
    preview: 'This is a test message from the Solana network...',
    date: 'Dec 25',
    isRead: true,
    isStarred: false,
  },
  {
    id: '4',
    from: 'bob@example.eth',
    subject: 'NFT Collection Update',
    preview: 'Your NFT collection has received a new bid...',
    date: 'Dec 24',
    isRead: false,
    isStarred: true,
  },
  {
    id: '5',
    from: 'defi-alerts.eth',
    subject: 'Staking Rewards Available',
    preview: 'You have unclaimed staking rewards. Click here to claim...',
    date: 'Dec 23',
    isRead: true,
    isStarred: false,
  },
];

export function MailListScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const [refreshing, setRefreshing] = useState(false);
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);

  const colors = {
    background: isDarkMode ? '#000000' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#8e8e93' : '#6e6e73',
    card: isDarkMode ? '#1c1c1e' : '#f2f2f7',
    border: isDarkMode ? '#38383a' : '#e5e5ea',
    primary: '#007AFF',
    unread: isDarkMode ? '#ffffff' : '#000000',
    read: isDarkMode ? '#8e8e93' : '#6e6e73',
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement actual refresh from API
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleEmailPress = useCallback(
    (email: Email) => {
      // Mark as read
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
      );
      navigation.navigate('EmailDetail', { emailId: email.id });
    },
    [navigation]
  );

  const handleMenuPress = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  const handleComposePress = useCallback(() => {
    navigation.navigate('Compose');
  }, [navigation]);

  const renderEmailItem = ({ item }: { item: Email }) => (
    <TouchableOpacity
      style={[styles.emailItem, { borderBottomColor: colors.border }]}
      onPress={() => handleEmailPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.emailContent}>
        <View style={styles.emailHeader}>
          <Text
            style={[
              styles.fromText,
              { color: item.isRead ? colors.read : colors.unread },
              !item.isRead && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {item.from}
          </Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {item.date}
          </Text>
        </View>
        <Text
          style={[
            styles.subjectText,
            { color: item.isRead ? colors.read : colors.unread },
            !item.isRead && styles.unreadText,
          ]}
          numberOfLines={1}
        >
          {item.subject}
        </Text>
        <Text
          style={[styles.previewText, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.preview}
        </Text>
      </View>
      {item.isStarred && <Text style={styles.starIcon}>⭐</Text>}
      {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <Text style={[styles.menuIcon, { color: colors.primary }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Inbox</Text>
        <TouchableOpacity onPress={handleComposePress} style={styles.composeButton}>
          <Text style={[styles.composeIcon, { color: colors.primary }]}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Email List */}
      <FlatList
        data={emails}
        keyExtractor={(item) => item.id}
        renderItem={renderEmailItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          isTablet && styles.listContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      />
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
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  composeButton: {
    padding: 8,
  },
  composeIcon: {
    fontSize: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  listContentTablet: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  emailItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  emailContent: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fromText: {
    fontSize: 16,
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    marginLeft: 8,
  },
  subjectText: {
    fontSize: 15,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 18,
  },
  starIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
    alignSelf: 'center',
  },
});
