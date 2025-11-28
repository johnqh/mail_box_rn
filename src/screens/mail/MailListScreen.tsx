import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NetworkClient } from '@sudobility/types';
import { useMessages, type Message } from '@sudobility/lib';
import { rnNetworkClient } from '@sudobility/di_rn';

import type { MailStackParamList, DrawerParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import {
  WILDDUCK_API_URL,
  WILDDUCK_API_TOKEN,
  BRAND_NAME,
  DEV_MODE,
  DEFAULT_PAGE_SIZE,
} from '../../config/app';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MailStackParamList, 'MailList'>,
  DrawerNavigationProp<DrawerParamList>
>;

interface EmailItem {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
}

// Constants for FlatList optimization
const EMAIL_ITEM_HEIGHT = 90; // Approximate height for getItemLayout
const WINDOW_SIZE = 10;
const MAX_TO_RENDER_PER_BATCH = 10;
const UPDATE_CELL_BATCH_PERIOD = 50;

/**
 * Memoized Email Item Component for better FlatList performance
 */
interface EmailItemProps {
  item: EmailItem;
  onPress: (item: EmailItem) => void;
  colors: {
    border: string;
    read: string;
    unread: string;
    textSecondary: string;
    primary: string;
  };
}

const EmailItemComponent = memo<EmailItemProps>(
  ({ item, onPress, colors }) => (
    <TouchableOpacity
      style={[styles.emailItem, { borderBottomColor: colors.border }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Email from ${item.from}. Subject: ${item.subject}. ${item.isRead ? 'Read' : 'Unread'}${item.isStarred ? ', Starred' : ''}`}
      accessibilityHint="Opens email details"
      accessibilityState={{ selected: !item.isRead }}
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
            accessibilityElementsHidden
          >
            {item.from}
          </Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]} accessibilityElementsHidden>
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
          accessibilityElementsHidden
        >
          {item.subject}
        </Text>
        <Text
          style={[styles.previewText, { color: colors.textSecondary }]}
          numberOfLines={2}
          accessibilityElementsHidden
        >
          {item.preview}
        </Text>
      </View>
      {item.isStarred && <Text style={styles.starIcon} accessibilityElementsHidden>⭐</Text>}
      {!item.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} accessibilityElementsHidden />
      )}
    </TouchableOpacity>
  ),
  (prevProps, nextProps) => {
    // Custom comparison for better memoization
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.isRead === nextProps.item.isRead &&
      prevProps.item.isStarred === nextProps.item.isStarred
    );
  }
);

// Mock data for development
const MOCK_EMAILS: EmailItem[] = [
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
    preview:
      'Here are some tips to help you get the most out of your new email...',
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

/**
 * Transform API Message to display EmailItem
 */
function transformMessageToEmailItem(message: Message): EmailItem {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return {
    id: message.id,
    from: message.from?.name || message.from?.address || 'Unknown',
    subject: message.subject || '(No subject)',
    preview: message.intro || '',
    date: formatDate(message.date),
    isRead: message.seen,
    isStarred: message.flagged,
  };
}

export function MailListScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const { wildduckUserAuth, isAuthenticated } = useAuth();
  const [searchText] = useState('');
  const [localReadState, setLocalReadState] = useState<Record<string, boolean>>(
    {}
  );

  // Fetch messages from API using @sudobility/lib hook directly
  const {
    messages: apiMessages,
    isLoading,
    refresh,
    next,
    hasMore,
  } = useMessages({
    endpointUrl: WILDDUCK_API_URL,
    apiToken: WILDDUCK_API_TOKEN,
    emailDomain: BRAND_NAME,
    networkClient: rnNetworkClient as NetworkClient,
    devMode: DEV_MODE,
    pageSize: DEFAULT_PAGE_SIZE,
    mailboxId: undefined, // Will use default INBOX
    searchText,
    searchScope: 'current',
    wildduckUserAuth,
    enabled: isAuthenticated && !!wildduckUserAuth,
    enableWebSocket: false, // WebSocket not supported in RN yet
  });

  // Use mock data in dev mode or when not authenticated
  const useMockData = DEV_MODE || !isAuthenticated || apiMessages.length === 0;

  // Transform API messages to display format
  const emails = useMemo(() => {
    if (useMockData) {
      return MOCK_EMAILS;
    }
    return apiMessages.map(transformMessageToEmailItem);
  }, [useMockData, apiMessages]);

  // Apply local read state on top of fetched data
  const emailsWithLocalState = useMemo(() => {
    return emails.map((email) => ({
      ...email,
      isRead: localReadState[email.id] ?? email.isRead,
    }));
  }, [emails, localReadState]);

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
    if (!useMockData) {
      await refresh();
    }
  }, [useMockData, refresh]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      next();
    }
  }, [hasMore, isLoading, next]);

  const handleEmailPress = useCallback(
    (email: EmailItem) => {
      // Mark as read locally
      setLocalReadState((prev) => ({ ...prev, [email.id]: true }));
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

  // Memoized colors object for EmailItemComponent
  const itemColors = useMemo(
    () => ({
      border: colors.border,
      read: colors.read,
      unread: colors.unread,
      textSecondary: colors.textSecondary,
      primary: colors.primary,
    }),
    [colors.border, colors.read, colors.unread, colors.textSecondary, colors.primary]
  );

  const renderEmailItem = useCallback(
    ({ item }: { item: EmailItem }) => (
      <EmailItemComponent
        item={item}
        onPress={handleEmailPress}
        colors={itemColors}
      />
    ),
    [handleEmailPress, itemColors]
  );

  // getItemLayout for better FlatList performance (enables scroll to index)
  const getItemLayout = useCallback(
    (_data: ArrayLike<EmailItem> | null | undefined, index: number) => ({
      length: EMAIL_ITEM_HEIGHT,
      offset: EMAIL_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderFooter = () => {
    if (!hasMore || isLoading) return null;
    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={handleLoadMore}
        activeOpacity={0.7}
      >
        <Text style={[styles.loadMoreText, { color: colors.primary }]}>
          Load More
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Loading emails...
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No emails yet
        </Text>
      </View>
    );
  };

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
        <TouchableOpacity
          onPress={handleComposePress}
          style={styles.composeButton}
        >
          <Text style={[styles.composeIcon, { color: colors.primary }]}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Email List - Optimized FlatList */}
      <FlatList
        data={emailsWithLocalState}
        keyExtractor={(item) => item.id}
        renderItem={renderEmailItem}
        getItemLayout={getItemLayout}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && emailsWithLocalState.length > 0}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          isTablet && styles.listContentTablet,
          emailsWithLocalState.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        // Performance optimizations
        windowSize={WINDOW_SIZE}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        updateCellsBatchingPeriod={UPDATE_CELL_BATCH_PERIOD}
        removeClippedSubviews={true}
        initialNumToRender={15}
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
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
