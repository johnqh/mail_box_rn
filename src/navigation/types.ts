import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack - pre-authentication screens
export type AuthStackParamList = {
  Landing: undefined;
  ConnectWallet: { chainType?: 'evm' | 'solana' };
};

// Main Tab Navigator - post-authentication
export type MainTabParamList = {
  AccountsTab: NavigatorScreenParams<AccountsStackParamList>;
  ComposeTab: NavigatorScreenParams<ComposeStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// Accounts Stack (within Tab)
export type AccountsStackParamList = {
  EmailAccountsList: undefined;
  MailboxesList: {
    accountId: string;
  };
  SettingsList: {
    accountId: string;
  };
  EmailsList: {
    accountId: string;
    mailboxId: string;
    mailboxName: string;
  };
  EmailDetail: {
    accountId: string;
    mailboxId: string;
    emailId: string;
  };
};

// Compose Stack
export type ComposeStackParamList = {
  Compose: {
    action?: 'compose' | 'reply' | 'replyAll' | 'forward';
    mailboxId?: string;
    emailId?: string;
    to?: string;
    subject?: string;
  };
};

// Settings Stack
export type SettingsStackParamList = {
  AppSettings: undefined;
  AccountSettings: {
    accountId: string;
  };
  Appearance: undefined;
  Language: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen Props Types
export type LandingScreenProps = NativeStackScreenProps<AuthStackParamList, 'Landing'>;
export type ConnectWalletScreenProps = NativeStackScreenProps<AuthStackParamList, 'ConnectWallet'>;
export type EmailAccountsListScreenProps = NativeStackScreenProps<AccountsStackParamList, 'EmailAccountsList'>;
export type MailboxesListScreenProps = NativeStackScreenProps<AccountsStackParamList, 'MailboxesList'>;
export type EmailsListScreenProps = NativeStackScreenProps<AccountsStackParamList, 'EmailsList'>;
export type EmailDetailScreenProps = NativeStackScreenProps<AccountsStackParamList, 'EmailDetail'>;
export type ComposeScreenProps = NativeStackScreenProps<ComposeStackParamList, 'Compose'>;
export type AppSettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'AppSettings'>;

// Tab Navigator Props
export type AccountsTabProps = BottomTabScreenProps<MainTabParamList, 'AccountsTab'>;
export type ComposeTabProps = BottomTabScreenProps<MainTabParamList, 'ComposeTab'>;
export type SettingsTabProps = BottomTabScreenProps<MainTabParamList, 'SettingsTab'>;

// Declare global navigation types for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
