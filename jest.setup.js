// Mock react-native-config
jest.mock('react-native-config', () => ({}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getBuildNumber: () => '1',
  getDeviceId: () => 'test-device',
  getUniqueId: () => Promise.resolve('test-unique-id'),
  getDeviceName: () => Promise.resolve('Test Device'),
  getBrand: () => 'Apple',
  getModel: () => 'iPhone',
  getSystemName: () => 'iOS',
  getSystemVersion: () => '16.0',
  isTablet: () => false,
}));

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => ({
  Biometrics: {
    FaceID: 'FaceID',
    TouchID: 'TouchID',
    Biometrics: 'Biometrics',
  },
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: () => Promise.resolve({ biometryType: null }),
    simplePrompt: () => Promise.resolve({ success: true }),
  })),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: () => Promise.resolve({ isConnected: true, type: 'wifi' }),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockView = ({ children, ...props }) => React.createElement(View, props, children);
  return {
    GestureHandlerRootView: MockView,
    Swipeable: MockView,
    DrawerLayout: MockView,
    State: {},
    ScrollView: MockView,
    Slider: MockView,
    Switch: MockView,
    TextInput: MockView,
    ToolbarAndroid: MockView,
    ViewPagerAndroid: MockView,
    DrawerLayoutAndroid: MockView,
    WebView: MockView,
    NativeViewGestureHandler: MockView,
    TapGestureHandler: MockView,
    FlingGestureHandler: MockView,
    ForceTouchGestureHandler: MockView,
    LongPressGestureHandler: MockView,
    PanGestureHandler: MockView,
    PinchGestureHandler: MockView,
    RotationGestureHandler: MockView,
    RawButton: MockView,
    BaseButton: MockView,
    RectButton: MockView,
    BorderlessButton: MockView,
    FlatList: MockView,
    gestureHandlerRootHOC: (component) => component,
    Directions: {},
  };
});

// Mock react-native-get-random-values
jest.mock('react-native-get-random-values', () => ({}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: ({ children }) => React.createElement(View, null, children),
    useSafeAreaInsets: () => inset,
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: inset,
    },
  };
});

// Mock @react-navigation
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    NavigationContainer: ({ children }) => React.createElement(View, null, children),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
    createNavigationContainerRef: () => ({ current: null }),
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: 'Screen',
  ScreenContainer: 'ScreenContainer',
  ScreenStack: 'ScreenStack',
  ScreenStackHeaderConfig: 'ScreenStackHeaderConfig',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-localize
jest.mock('react-native-localize', () => ({
  getLocales: () => [{ countryCode: 'US', languageTag: 'en-US', languageCode: 'en', isRTL: false }],
  getNumberFormatSettings: () => ({ decimalSeparator: '.', groupingSeparator: ',' }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock @sudobility/di_rn
jest.mock('@sudobility/di_rn', () => ({
  RNEnvProvider: jest.fn().mockImplementation(() => ({
    get: jest.fn(() => null),
    getAll: jest.fn(() => ({})),
    isDevelopment: jest.fn(() => true),
    isProduction: jest.fn(() => false),
    isTest: jest.fn(() => true),
  })),
  createRNAppConfig: jest.fn(() => ({
    wildDuckBackendUrl: 'https://wildduck.0xmail.box',
    indexerBackendUrl: 'https://indexer.0xmail.box',
    walletConnectProjectId: '',
    revenueCatApiKey: '',
    privyAppId: '',
    firebase: { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' },
    useCloudflareWorker: false,
    cloudflareWorkerUrl: '',
    useMockFallback: false,
  })),
  initializeStorageService: jest.fn(),
  initializeNetworkService: jest.fn(),
  rnEnvProvider: {
    get: jest.fn(() => null),
    getAll: jest.fn(() => ({})),
    isDevelopment: jest.fn(() => true),
    isProduction: jest.fn(() => false),
    isTest: jest.fn(() => true),
  },
  rnAppConfig: {
    wildDuckBackendUrl: 'https://wildduck.0xmail.box',
    indexerBackendUrl: 'https://indexer.0xmail.box',
    walletConnectProjectId: '',
    revenueCatApiKey: '',
    privyAppId: '',
    firebase: { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' },
    useCloudflareWorker: false,
    cloudflareWorkerUrl: '',
    useMockFallback: false,
  },
}));

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) => React.createElement(View, null, children),
      Screen: ({ children }) => React.createElement(View, null, children),
    }),
  };
});

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => React.createElement(View, null, children),
      Screen: ({ children }) => React.createElement(View, null, children),
    }),
  };
});

// Mock i18next
jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValue(undefined),
  t: (key) => key,
  changeLanguage: jest.fn(),
}));

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({
    defaultQueryOptions: jest.fn(),
    getQueryCache: jest.fn(() => ({ find: jest.fn() })),
    getMutationCache: jest.fn(() => ({ find: jest.fn() })),
  })),
  QueryClientProvider: ({ children }) => children,
  useQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}));
