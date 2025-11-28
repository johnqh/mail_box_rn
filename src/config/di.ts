/**
 * Dependency Injection initialization for React Native.
 *
 * This module initializes all platform-specific services from @sudobility/di_rn.
 * Call initializeDI() early in app startup (before rendering).
 */

// TODO: Uncomment when @sudobility/di_rn is published and linked
// import {
//   initializeStorageService,
//   initializeNetworkService,
//   initializeAnalyticsClient,
//   initializeNotificationService,
//   initializeThemeService,
//   initializeLoggerProvider,
//   initializeNavigationService,
// } from '@sudobility/di_rn';

let isInitialized = false;

export function initializeDI(): void {
  if (isInitialized) {
    return;
  }

  console.log('[DI] Initializing React Native services...');

  // Initialize all services
  // TODO: Uncomment when @sudobility/di_rn is available
  // initializeStorageService();
  // initializeNetworkService();
  // initializeAnalyticsClient();
  // initializeNotificationService();
  // initializeThemeService();
  // initializeLoggerProvider();
  // initializeNavigationService();

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
  // TODO: Uncomment when @sudobility/di_rn is available
  // resetStorageService();
  // resetNetworkService();
  // resetAnalyticsClient();
  // resetNotificationService();
  // resetThemeService();
  // resetLoggerProvider();
  // resetNavigationService();

  isInitialized = false;
}
