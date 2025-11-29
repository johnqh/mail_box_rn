import React, { useState, createContext, useContext, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AccountsStackParamList } from './types';

// Screens
import EmailAccountsListScreen from '../screens/accounts/EmailAccountsListScreen';
import MailboxesListScreen from '../screens/mailboxes/MailboxesListScreen';
import SettingsListScreen from '../screens/mailboxes/SettingsScreen';
import EmailsListScreen from '../screens/emails/EmailsListScreen';
import EmailDetailScreen from '../screens/emails/EmailDetailScreen';

// Fixed width as per design decision
const MASTER_PANE_WIDTH = 400;

// Context for split view coordination
interface SplitViewContextValue {
  selectedEmail: { accountId: string; mailboxId: string; emailId: string } | null;
  setSelectedEmail: (email: { accountId: string; mailboxId: string; emailId: string } | null) => void;
}

const SplitViewContext = createContext<SplitViewContextValue | null>(null);

export const useSplitView = () => {
  const context = useContext(SplitViewContext);
  if (!context) {
    throw new Error('useSplitView must be used within TabletNavigator');
  }
  return context;
};

// Master Stack Navigator (left pane)
const MasterStack = createNativeStackNavigator<AccountsStackParamList>();

const MasterNavigator: React.FC = () => {
  return (
    <MasterStack.Navigator screenOptions={{ headerShown: false }}>
      <MasterStack.Screen name="EmailAccountsList" component={EmailAccountsListScreen} />
      <MasterStack.Screen name="MailboxesList" component={MailboxesListScreen} />
      <MasterStack.Screen name="SettingsList" component={SettingsListScreen} />
      <MasterStack.Screen name="EmailsList" component={EmailsListScreen} />
      <MasterStack.Screen name="EmailDetail" component={EmailDetailScreen} />
    </MasterStack.Navigator>
  );
};

// Empty detail view placeholder
const EmptyDetailView: React.FC = () => (
  <View style={styles.emptyDetail}>
    <Text style={styles.emptyDetailText}>Select an email to view</Text>
  </View>
);

// Detail View Component
const DetailView: React.FC = () => {
  const { selectedEmail } = useSplitView();

  if (!selectedEmail) {
    return <EmptyDetailView />;
  }

  // In a full implementation, this would render EmailDetailScreen
  // For now, we use a simplified approach where detail is shown in master stack
  return <EmptyDetailView />;
};

// Main Tablet Navigator with Split View
export const TabletNavigator: React.FC = () => {
  const [selectedEmail, setSelectedEmail] = useState<{
    accountId: string;
    mailboxId: string;
    emailId: string;
  } | null>(null);

  const handleSetSelectedEmail = useCallback((email: typeof selectedEmail) => {
    setSelectedEmail(email);
  }, []);

  return (
    <SplitViewContext.Provider
      value={{ selectedEmail, setSelectedEmail: handleSetSelectedEmail }}
    >
      <View style={styles.container}>
        {/* Master Pane - Fixed width */}
        <View style={[styles.masterPane, { width: MASTER_PANE_WIDTH }]}>
          <MasterNavigator />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Detail Pane - Flexible width */}
        <View style={styles.detailPane}>
          <DetailView />
        </View>
      </View>
    </SplitViewContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  masterPane: {
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  detailPane: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyDetail: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDetailText: {
    fontSize: 16,
    color: '#999999',
  },
});

export default TabletNavigator;
