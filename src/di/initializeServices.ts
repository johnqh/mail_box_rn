import { Alert } from 'react-native';

// Import with error handling to debug module resolution
let diRnModule: typeof import('@sudobility/di_rn') | null = null;
try {
  diRnModule = require('@sudobility/di_rn');
} catch (e) {
  Alert.alert('Import Error', `Failed to import @sudobility/di_rn: ${e}`);
}

// Debug: Log what we got
if (diRnModule) {
  const keys = Object.keys(diRnModule);
  if (!diRnModule.RNEnvProvider) {
    Alert.alert('Module Debug', `di_rn keys: ${keys.join(', ')}\nRNEnvProvider: ${typeof diRnModule.RNEnvProvider}`);
  }
}

type AppConfig = import('@sudobility/di').AppConfig;

let servicesInitialized = false;
let appConfig: AppConfig | null = null;

export function initializeAllServices(): AppConfig {
  if (servicesInitialized && appConfig) {
    return appConfig;
  }

  if (!diRnModule) {
    Alert.alert('Error', 'di_rn module not loaded');
    // Return a default config
    return {
      wildDuckBackendUrl: 'https://wildduck.0xmail.box',
      indexerBackendUrl: 'https://indexer.0xmail.box',
      walletConnectProjectId: '',
      revenueCatApiKey: '',
      privyAppId: '',
      firebase: { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' },
      useCloudflareWorker: false,
      cloudflareWorkerUrl: '',
      useMockFallback: false,
    };
  }

  try {
    const { RNEnvProvider, createRNAppConfig, initializeStorageService, initializeNetworkService } = diRnModule;

    // 1. Initialize environment provider and app config
    const envProvider = new RNEnvProvider();
    appConfig = createRNAppConfig(envProvider);

    // 2. Initialize storage service (for persisting data)
    initializeStorageService();

    // 3. Initialize network services
    initializeNetworkService();

    servicesInitialized = true;
    return appConfig;
  } catch (error) {
    Alert.alert('Init Error', `${error}`);
    // Return a default config
    return {
      wildDuckBackendUrl: 'https://wildduck.0xmail.box',
      indexerBackendUrl: 'https://indexer.0xmail.box',
      walletConnectProjectId: '',
      revenueCatApiKey: '',
      privyAppId: '',
      firebase: { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' },
      useCloudflareWorker: false,
      cloudflareWorkerUrl: '',
      useMockFallback: false,
    };
  }
}

export function getAppConfig(): AppConfig {
  if (!appConfig) {
    return initializeAllServices();
  }
  return appConfig;
}

export function isServicesInitialized(): boolean {
  return servicesInitialized;
}
