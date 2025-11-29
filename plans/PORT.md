# React Native Port Implementation Plan

## Overview

Port the `mail_box` ReactJS web app to React Native (`mail_box_rn`) with:
- Multi-chain wallet support (EVM + Solana)
- Full email flow with business logic from `@sudobility/lib`
- Native split-view navigation for tablets
- 16 language localization support
- Phased feature rollout (Biometrics → Deep Linking → Push Notifications)

---

## Phase 1: Project Foundation

### 1.1 Dependencies Installation

```bash
# Core @sudobility packages
npm install @sudobility/lib @sudobility/wildduck_client @sudobility/indexer_client
npm install @sudobility/types @sudobility/di @sudobility/di_rn
npm install @sudobility/design @sudobility/components-rn
npm install @sudobility/analytics-components-rn @sudobility/devops-components-rn
npm install @sudobility/email-components-rn @sudobility/marketing-components-rn
npm install @sudobility/social-components-rn @sudobility/web3-components-rn

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-gesture-handler

# Wallet/Web3 (Reown AppKit - unified EVM + Solana)
npm install @reown/appkit-react-native @reown/appkit-wagmi-react-native @reown/appkit-solana-react-native
npm install @walletconnect/react-native-compat wagmi viem @tanstack/react-query
npm install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js
npm install @solana/web3.js siwe bs58

# DI Dependencies
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
npm install @react-native-firebase/app @react-native-firebase/analytics
npm install react-native-config

# i18n
npm install i18next react-i18next react-native-localize

# UI/Styling
npm install nativewind react-native-reanimated react-native-svg
npm install react-native-device-info

# State Management
npm install zustand

# Polyfills
npm install react-native-get-random-values text-encoding fast-text-encoding

# Biometrics (for app launch authentication)
npm install react-native-biometrics
```

### 1.2 Project Structure

```
mail_box_rn/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Root component with providers
│   │   ├── AppProviders.tsx        # Provider composition
│   │   └── BiometricGate.tsx       # Auth gate on every launch
│   │
│   ├── config/
│   │   ├── app.config.ts           # AppConfig from @sudobility/di_rn
│   │   ├── chains.ts               # EVM + Solana chain configs
│   │   └── appkit.ts               # Reown AppKit setup
│   │
│   ├── di/
│   │   ├── initializeServices.ts   # Service initialization
│   │   └── ServiceContext.tsx      # React context for DI
│   │
│   ├── i18n/
│   │   ├── index.ts                # i18n initialization
│   │   └── config.ts               # Language detection
│   │
│   ├── navigation/
│   │   ├── types.ts                # Navigation param types
│   │   ├── RootNavigator.tsx       # Auth state switching
│   │   ├── AuthNavigator.tsx       # Landing + Connect screens
│   │   ├── MainNavigator.tsx       # Conditional phone/tablet
│   │   ├── PhoneNavigator.tsx      # Bottom tabs for phones
│   │   ├── TabletNavigator.tsx     # Split view for tablets
│   │   └── linking.ts              # Deep link config
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LandingScreen.tsx
│   │   │   └── ConnectWalletScreen.tsx
│   │   ├── accounts/
│   │   │   └── EmailAccountsListScreen.tsx
│   │   ├── mailboxes/
│   │   │   ├── MailboxesListScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   ├── emails/
│   │   │   ├── EmailsListScreen.tsx
│   │   │   └── EmailDetailScreen.tsx
│   │   └── compose/
│   │       └── ComposeScreen.tsx
│   │
│   ├── wallet/
│   │   ├── providers/
│   │   │   └── WalletProvider.tsx
│   │   ├── hooks/
│   │   │   ├── useMultiChainWallet.ts
│   │   │   └── useBiometrics.ts
│   │   └── services/
│   │       ├── SIWEService.ts
│   │       └── SIWSService.ts
│   │
│   ├── hooks/
│   │   ├── useDeviceLayout.ts      # Phone/tablet detection
│   │   └── useAuth.ts
│   │
│   └── components/
│       └── layout/
│           ├── SplitViewContainer.tsx
│           ├── MasterPane.tsx
│           └── DetailPane.tsx
│
├── assets/
│   └── locales/                    # 16 language JSON files
│
├── .env                            # Environment variables
├── metro.config.js                 # Monorepo configuration
└── tsconfig.json                   # TypeScript paths
```

### 1.3 Metro Configuration for Monorepo

**metro.config.js:**
```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const monorepoRoot = path.resolve(__dirname, '..');

const sudobilityPackages = {
  '@sudobility/lib': path.resolve(monorepoRoot, 'mail_box_lib'),
  '@sudobility/types': path.resolve(monorepoRoot, 'types'),
  '@sudobility/di': path.resolve(monorepoRoot, 'di'),
  '@sudobility/di_rn': path.resolve(monorepoRoot, 'di_rn'),
  '@sudobility/design': path.resolve(monorepoRoot, 'design_system'),
  '@sudobility/components-rn': path.resolve(monorepoRoot, 'mail_box_components_rn'),
  '@sudobility/wildduck_client': path.resolve(monorepoRoot, 'wildduck_client'),
  '@sudobility/indexer_client': path.resolve(monorepoRoot, 'mail_box_indexer_client'),
};

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  watchFolders: [monorepoRoot, ...Object.values(sudobilityPackages)],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    extraNodeModules: {
      ...sudobilityPackages,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
  },
});
```

### 1.4 Environment Configuration

**.env:**
```bash
VITE_WILDDUCK_URL=https://wildduck.0xmail.box
VITE_INDEXER_URL=https://indexer.0xmail.box
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_REVENUECAT_API_KEY=your_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## Phase 2: DI and Service Initialization

### 2.1 Service Initialization

**src/di/initializeServices.ts:**
```typescript
import {
  initializeStorageService,
  initializeNetworkService,
  initializeAnalyticsClient,
  RNEnvProvider,
  createRNAppConfig,
} from '@sudobility/di_rn';

let initialized = false;
let appConfig: AppConfig | null = null;

export function initializeAllServices(): AppConfig {
  if (initialized && appConfig) return appConfig;

  const envProvider = new RNEnvProvider();
  appConfig = createRNAppConfig(envProvider);

  initializeStorageService();
  initializeNetworkService();
  initializeAnalyticsClient();

  initialized = true;
  return appConfig;
}
```

### 2.2 i18n Setup

**src/i18n/index.ts:**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';

const SUPPORTED_LANGUAGES = [
  'en', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko',
  'pt', 'ru', 'sv', 'th', 'uk', 'vi', 'zh', 'zh-hant',
];

export const initializeI18n = async () => {
  const deviceLang = getLocales()[0]?.languageCode || 'en';

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    lng: SUPPORTED_LANGUAGES.includes(deviceLang) ? deviceLang : 'en',
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    react: { useSuspense: false },
  });
};
```

---

## Phase 3: Navigation Architecture

### 3.1 Navigation Types

**src/navigation/types.ts:**
```typescript
export type AuthStackParamList = {
  Landing: undefined;
  ConnectWallet: { chainType?: 'evm' | 'solana' };
};

export type AccountsStackParamList = {
  EmailAccountsList: undefined;
  MailboxesList: { accountId: string };
  SettingsList: { accountId: string };
  EmailsList: { accountId: string; mailboxId: string };
  EmailDetail: { accountId: string; mailboxId: string; emailId: string };
};

export type ComposeStackParamList = {
  Compose: {
    action?: 'compose' | 'reply' | 'replyAll' | 'forward';
    emailId?: string;
    to?: string;
  };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
};
```

### 3.2 Device Layout Detection

**src/hooks/useDeviceLayout.ts:**
```typescript
import { useWindowDimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const TABLET_BREAKPOINT = 768;

export const useDeviceLayout = () => {
  const { width } = useWindowDimensions();
  const isTablet = DeviceInfo.isTablet() || width >= TABLET_BREAKPOINT;

  return {
    isTablet,
    showSplitView: isTablet,
    masterPaneWidth: width >= 1024 ? 450 : 350,
  };
};
```

### 3.3 Root Navigator with Auth State

**src/navigation/RootNavigator.tsx:**
```typescript
export const RootNavigator = () => {
  const { authStatus } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authStatus !== 'VERIFIED' ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};
```

### 3.4 Adaptive Main Navigator

**src/navigation/MainNavigator.tsx:**
```typescript
export const MainNavigator = () => {
  const { showSplitView } = useDeviceLayout();

  return showSplitView ? <TabletNavigator /> : <PhoneNavigator />;
};
```

### 3.5 Phone Navigator (Bottom Tabs)

**src/navigation/PhoneNavigator.tsx:**
```typescript
export const PhoneNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="AccountsTab" component={AccountsStackNavigator} />
    <Tab.Screen name="ComposeTab" component={ComposeStackNavigator} />
    <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} />
  </Tab.Navigator>
);
```

### 3.6 Tablet Split View Navigator (Fixed Width)

**Decision:** Fixed master pane width (not user-resizable) for simpler implementation and consistent layout.

**src/navigation/TabletNavigator.tsx:**
```typescript
const MASTER_PANE_WIDTH = 400; // Fixed width for simplicity

export const TabletNavigator = () => {
  const [selectedEmail, setSelectedEmail] = useState(null);

  return (
    <View style={styles.container}>
      {/* Fixed width master pane - not resizable */}
      <View style={[styles.masterPane, { width: MASTER_PANE_WIDTH }]}>
        <MasterStackNavigator onSelectEmail={setSelectedEmail} />
      </View>
      <View style={styles.divider} />
      <View style={styles.detailPane}>
        <DetailStackNavigator selectedEmail={selectedEmail} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  masterPane: { backgroundColor: '#f5f5f5' },
  divider: { width: 1, backgroundColor: '#e0e0e0' },
  detailPane: { flex: 1 },
});
```

### 3.7 Deep Linking

**src/navigation/linking.ts:**
```typescript
export const linking = {
  prefixes: ['mailboxrn://', 'https://app.0xmail.box'],
  config: {
    screens: {
      Main: {
        screens: {
          AccountsTab: {
            screens: {
              EmailDetail: 'email/:accountId/:mailboxId/:emailId',
            },
          },
          ComposeTab: {
            screens: {
              Compose: 'compose',
            },
          },
        },
      },
    },
  },
};
```

---

## Phase 4: Wallet Integration

### 4.1 AppKit Configuration

**src/config/appkit.ts:**
```typescript
import "@walletconnect/react-native-compat";
import { createAppKit } from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { mainnet, polygon, arbitrum, optimism } from "viem/chains";

const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID!;

const evmNetworks = [mainnet, polygon, arbitrum, optimism];
const wagmiAdapter = new WagmiAdapter({ networks: evmNetworks, projectId });
const solanaAdapter = new SolanaAdapter();

export const appKit = createAppKit({
  projectId,
  metadata: {
    name: "0xMail",
    description: "Decentralized Email",
    url: "https://0xmail.app",
    icons: ["https://0xmail.app/icon.png"],
    redirect: { native: "mailboxrn://" },
  },
  adapters: [wagmiAdapter, solanaAdapter],
  networks: evmNetworks,
});
```

### 4.2 Wallet Provider

**src/wallet/providers/WalletProvider.tsx:**
```typescript
export function WalletProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider instance={appKit}>
          {children}
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 4.3 Multi-Chain Wallet Hook

**src/wallet/hooks/useMultiChainWallet.ts:**
```typescript
export function useMultiChainWallet() {
  const { address: evmAddress } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Solana via Mobile Wallet Adapter
  const connectSolana = async () => {
    return transact(async (wallet) => {
      const auth = await wallet.authorize({
        cluster: "mainnet-beta",
        identity: { name: "0xMail" },
      });
      return auth.accounts[0];
    });
  };

  const signIn = async (chainType: 'evm' | 'solana') => {
    if (chainType === 'evm') {
      // SIWE flow
      const message = createSiweMessage(evmAddress);
      const signature = await signMessageAsync({ message });
      return { message, signature };
    } else {
      // SIWS flow via MWA
      return connectSolana();
    }
  };

  return { evmAddress, signIn, connectSolana };
}
```

### 4.4 Native Configuration

**iOS Info.plist additions:**
```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>wc</string>
  <string>metamask</string>
  <string>phantom</string>
  <string>solflare</string>
  <string>trust</string>
  <string>rainbow</string>
  <string>cbwallet</string>
</array>
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>mailboxrn</string>
    </array>
  </dict>
</array>
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to access your wallet</string>
```

**Android AndroidManifest.xml additions:**
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<queries>
  <package android:name="io.metamask" />
  <package android:name="app.phantom" />
  <package android:name="com.solflare.mobile" />
  <package android:name="com.wallet.crypto.trustapp" />
</queries>
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="mailboxrn" />
</intent-filter>
```

---

## Phase 5: Screen Implementation

### 5.1 Landing Screen

**src/screens/auth/LandingScreen.tsx:**
```typescript
export const LandingScreen = ({ navigation }) => {
  const { t } = useTranslation('landingPage');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome')}</Text>
      <Text style={styles.subtitle}>{t('subtitle')}</Text>
      <Button
        title={t('connectWallet')}
        onPress={() => navigation.navigate('ConnectWallet')}
      />
    </View>
  );
};
```

### 5.2 Connect Wallet Screen

**src/screens/auth/ConnectWalletScreen.tsx:**
```typescript
export const ConnectWalletScreen = () => {
  const { t } = useTranslation('connectWalletPage');
  const { open } = useAppKit();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('selectWallet')}</Text>
      <Button title={t('connectEVM')} onPress={() => open({ view: 'Connect' })} />
      <Button title={t('connectSolana')} onPress={connectSolana} />
    </View>
  );
};
```

### 5.3 Email Accounts List Screen

**src/screens/accounts/EmailAccountsListScreen.tsx:**
```typescript
export const EmailAccountsListScreen = ({ navigation }) => {
  const { t } = useTranslation('mailApp');
  const { data: accounts } = useEmailAccounts(); // from @sudobility/lib

  return (
    <FlatList
      data={accounts}
      renderItem={({ item }) => (
        <AccountListItem
          account={item}
          onPress={() => navigation.navigate('MailboxesList', { accountId: item.id })}
        />
      )}
    />
  );
};
```

### 5.4 Email Flow (Mailboxes → Emails → Detail)

Business logic from `@sudobility/lib` hooks:
- `useEmailAccounts()` - List wallet email accounts
- `useMailboxes(accountId)` - Get INBOX, Sent, Drafts, etc.
- `useEmails(accountId, mailboxId)` - Paginated email list
- `useEmail(emailId)` - Single email with full content
- `useSendEmail()` - Send/reply/forward mutation

---

## Phase 6: Feature Phases

### 6.1 Phase A: Biometric Authentication (Every Launch)

**Decision:** Require biometric authentication on every app launch for maximum security.

```typescript
// src/wallet/hooks/useBiometrics.ts
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export function useBiometrics() {
  const authenticate = async () => {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Authenticate to access 0xMail',
    });
    return success;
  };

  const checkAvailability = async () => {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return { available, biometryType };
  };

  return { authenticate, checkAvailability };
}

// src/app/BiometricGate.tsx - Wrap app to require auth on launch
export function BiometricGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticate, checkAvailability } = useBiometrics();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Authenticate on initial load
    performAuth();

    // Re-authenticate when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        performAuth();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const performAuth = async () => {
    setIsLoading(true);
    const { available } = await checkAvailability();
    if (available) {
      const success = await authenticate();
      setIsAuthenticated(success);
    } else {
      setIsAuthenticated(true); // Skip if biometrics unavailable
    }
    setIsLoading(false);
  };

  if (isLoading) return <SplashScreen />;
  if (!isAuthenticated) return <BiometricPromptScreen onRetry={performAuth} />;
  return children;
}
```

### 6.2 Phase B: Deep Linking

Already configured in `linking.ts`. Handle in App.tsx:
```typescript
const linking = {
  prefixes: ['mailboxrn://'],
  config: { /* screen mapping */ },
  async getInitialURL() {
    // Handle notification tap
    const notificationUrl = await getNotificationDeepLink();
    return notificationUrl || Linking.getInitialURL();
  },
};
```

### 6.3 Phase C: Push Notifications (Last)

```typescript
// After completing email functionality
npm install @notifee/react-native @react-native-firebase/messaging

// Register for push in src/notifications/setup.ts
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

export async function setupNotifications() {
  const token = await messaging().getToken();
  // Send token to backend

  messaging().onMessage(async (remoteMessage) => {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
    });
  });
}
```

---

## Implementation Order

1. **Week 1: Foundation**
   - [ ] Install all dependencies
   - [ ] Configure Metro for monorepo
   - [ ] Set up environment variables
   - [ ] Initialize DI services
   - [ ] Configure i18n with 16 languages

2. **Week 2: Navigation**
   - [ ] Implement navigation types
   - [ ] Create RootNavigator with auth state
   - [ ] Build PhoneNavigator (bottom tabs)
   - [ ] Build TabletNavigator (split view)
   - [ ] Add device layout detection

3. **Week 3: Wallet Integration**
   - [ ] Configure Reown AppKit
   - [ ] Implement WalletProvider
   - [ ] Build ConnectWalletScreen
   - [ ] Add SIWE (EVM) authentication
   - [ ] Add SIWS (Solana) via MWA

4. **Week 4: Email Screens**
   - [ ] EmailAccountsListScreen
   - [ ] MailboxesListScreen + SettingsScreen
   - [ ] EmailsListScreen with virtualization
   - [ ] EmailDetailScreen
   - [ ] ComposeScreen (new/reply/forward)

5. **Week 5: Biometrics + Deep Linking**
   - [ ] Add biometric auth on app launch
   - [ ] Configure deep linking
   - [ ] Handle notification deep links

6. **Week 6: Push Notifications + Polish**
   - [ ] Firebase Cloud Messaging setup
   - [ ] Notifee local notifications
   - [ ] Testing across devices
   - [ ] Performance optimization

---

## Critical Files to Reference

| File | Purpose |
|------|---------|
| `../mail_box/src/main.tsx` | Service initialization pattern |
| `../mail_box/src/App.tsx` | Provider hierarchy structure |
| `../mail_box/src/middleware/useMultiChainWallet.ts` | Wallet auth flow |
| `../mail_box/src/i18n.ts` | i18n configuration |
| `../mail_box/src/pages/MailApp.tsx` | Email UI patterns |
| `../di_rn/src/index.ts` | DI exports for React Native |
| `../di_rn/src/env/env.rn.ts` | RNEnvProvider implementation |

---

## Supported Wallets

### EVM (via WalletConnect v2)
- MetaMask, Trust Wallet, Rainbow, Coinbase Wallet
- Safe, Argent, 1inch, Zerion, imToken
- 200+ WalletConnect-compatible wallets

### Solana (via Mobile Wallet Adapter)
- Phantom, Solflare
- Any MWA 2.0 compliant wallet
