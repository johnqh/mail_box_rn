/**
 * Dependency Injection initialization for React Native.
 *
 * This module initializes all platform-specific services from @sudobility/di_rn.
 * Call initializeDI() early in app startup (before rendering).
 */

import {
  initializeStorageService,
  initializeNetworkService,
  initializeAnalyticsClient,
  initializeNotificationService,
  initializeThemeService,
  initializeLoggerProvider,
  initializeNavigationService,
  resetStorageService,
  resetNetworkService,
  resetAnalyticsClient,
  resetNotificationService,
  resetThemeService,
  resetLoggerProvider,
  resetNavigationService,
  getNetworkClient,
  rnAppConfig,
} from '@sudobility/di_rn';

let isInitialized = false;

export function initializeDI(): void {
  if (isInitialized) {
    return;
  }

  console.log('[DI] Initializing React Native services...');

  // Initialize all services
  initializeStorageService();
  initializeNetworkService();
  initializeAnalyticsClient();
  initializeNotificationService();
  initializeThemeService();
  initializeLoggerProvider();
  initializeNavigationService();

  isInitialized = true;
  console.log('[DI] React Native services initialized');
}

export function isDIInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset all services (useful for testing).
 */
export function resetDI(): void {
  resetStorageService();
  resetNetworkService();
  resetAnalyticsClient();
  resetNotificationService();
  resetThemeService();
  resetLoggerProvider();
  resetNavigationService();

  isInitialized = false;
}

/**
 * Get the network client for making API requests.
 * Must call initializeDI() first.
 */
export function getApiClient() {
  if (!isInitialized) {
    throw new Error('DI not initialized. Call initializeDI() first.');
  }
  return getNetworkClient();
}

/**
 * Get the app configuration.
 */
export function getAppConfig() {
  return rnAppConfig;
}
