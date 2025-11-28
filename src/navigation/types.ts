import type { NavigatorScreenParams } from '@react-navigation/native';

// Mail stack screens
export type MailStackParamList = {
  MailList: undefined;
  EmailDetail: { emailId: string };
  Compose: {
    replyTo?: string;
    forward?: string;
    to?: string;
    subject?: string;
    body?: string;
  } | undefined;
};

// Drawer navigation (sidebar)
export type DrawerParamList = {
  Inbox: NavigatorScreenParams<MailStackParamList>;
  Sent: NavigatorScreenParams<MailStackParamList>;
  Drafts: NavigatorScreenParams<MailStackParamList>;
  Starred: NavigatorScreenParams<MailStackParamList>;
  Trash: NavigatorScreenParams<MailStackParamList>;
  Settings: undefined;
};

// Root stack (auth + main app)
export type RootStackParamList = {
  ConnectWallet: undefined;
  Main: NavigatorScreenParams<DrawerParamList>;
};

// Mailbox types
export type MailboxType = 'inbox' | 'sent' | 'drafts' | 'starred' | 'trash';

export interface Mailbox {
  id: string;
  name: string;
  type: MailboxType;
  unreadCount: number;
}

// Global navigation ref type
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
