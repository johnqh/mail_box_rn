// Jest setup file for mocking native modules

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  Swipeable: 'Swipeable',
  DrawerLayout: 'DrawerLayout',
  State: {},
  ScrollView: 'ScrollView',
  Slider: 'Slider',
  Switch: 'Switch',
  TextInput: 'TextInput',
  TouchableHighlight: 'TouchableHighlight',
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  View: 'View',
  FlatList: 'FlatList',
  gestureHandlerRootHOC: (component) => component,
  Directions: {},
}));

// Mock react-native-get-random-values
jest.mock('react-native-get-random-values', () => ({}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({ children }) => children,
  useNavigationContainerRef: () => ({ current: null, isReady: () => true }),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  }),
}));

// Mock @react-navigation/drawer
jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  }),
}));

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock react-native-config
jest.mock('react-native-config', () => ({}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
}));

// Mock @react-native-firebase/app
jest.mock('@react-native-firebase/app', () => ({
  initializeApp: jest.fn(),
}));

// Mock @react-native-firebase/analytics
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(() => Promise.resolve()),
  setUserProperty: jest.fn(() => Promise.resolve()),
  setUserId: jest.fn(() => Promise.resolve()),
  setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
  logScreenView: jest.fn(() => Promise.resolve()),
}));

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  displayNotification: jest.fn(() => Promise.resolve('notification-id')),
  createChannel: jest.fn(() => Promise.resolve()),
  requestPermission: jest.fn(() =>
    Promise.resolve({ authorizationStatus: 1 })
  ),
  cancelNotification: jest.fn(() => Promise.resolve()),
  cancelAllNotifications: jest.fn(() => Promise.resolve()),
  getBadgeCount: jest.fn(() => Promise.resolve(0)),
  setBadgeCount: jest.fn(() => Promise.resolve()),
  AndroidImportance: { HIGH: 4 },
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    call: jest.fn(),
    createAnimatedComponent: (component) => component,
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: jest.fn() },
  },
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
  withDelay: jest.fn((_, value) => value),
  useAnimatedGestureHandler: jest.fn(),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
  },
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock react-native-mmkv (used by WalletConnect)
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

// Mock @walletconnect packages
jest.mock('@walletconnect/modal-react-native', () => ({
  WalletConnectModal: ({ children }) => children,
  useWalletConnectModal: () => ({
    open: jest.fn(),
    close: jest.fn(),
    isOpen: false,
    provider: null,
  }),
}));

jest.mock('@walletconnect/web3wallet', () => ({
  Web3Wallet: {
    init: jest.fn(),
  },
}));
