/**
 * Native Split View Module
 *
 * JavaScript interface for iOS/Android native split view capabilities.
 * Provides device detection and layout recommendations.
 */

import { NativeModules, Platform } from 'react-native';

interface NativeSplitViewModule {
  isIPad(): Promise<boolean>;
  getDeviceType(): Promise<'phone' | 'tablet' | 'desktop' | 'unknown'>;
  getHorizontalSizeClass(): Promise<'compact' | 'regular' | 'unknown'>;
  getRecommendedSplitRatio(): Promise<number>;
  shouldShowSplitView(): Promise<boolean>;
}

// Get native module (only available on iOS currently)
const RNSplitView = NativeModules.RNSplitView as NativeSplitViewModule | undefined;

/**
 * Check if running on iPad
 */
export async function isIPad(): Promise<boolean> {
  if (Platform.OS === 'ios' && RNSplitView) {
    return RNSplitView.isIPad();
  }
  return false;
}

/**
 * Get device type (phone, tablet, desktop, unknown)
 */
export async function getDeviceType(): Promise<'phone' | 'tablet' | 'desktop' | 'unknown'> {
  if (Platform.OS === 'ios' && RNSplitView) {
    return RNSplitView.getDeviceType();
  }

  // Android fallback - use screen dimensions
  if (Platform.OS === 'android') {
    // Import dynamically to avoid circular deps
    const { Dimensions } = require('react-native');
    const { width, height } = Dimensions.get('window');
    const diagonal = Math.sqrt(width * width + height * height);
    // Tablets typically have diagonal > 1100 (7" at 160dpi)
    return diagonal > 1100 ? 'tablet' : 'phone';
  }

  return 'unknown';
}

/**
 * Get horizontal size class (iOS)
 * - compact: Phone-like, single column layout
 * - regular: Tablet-like, can show split view
 */
export async function getHorizontalSizeClass(): Promise<'compact' | 'regular' | 'unknown'> {
  if (Platform.OS === 'ios' && RNSplitView) {
    return RNSplitView.getHorizontalSizeClass();
  }

  // Android fallback
  if (Platform.OS === 'android') {
    const deviceType = await getDeviceType();
    return deviceType === 'tablet' ? 'regular' : 'compact';
  }

  return 'unknown';
}

/**
 * Get recommended split ratio for master panel
 * Returns value between 0 and 1
 */
export async function getRecommendedSplitRatio(): Promise<number> {
  if (Platform.OS === 'ios' && RNSplitView) {
    return RNSplitView.getRecommendedSplitRatio();
  }

  // Android fallback
  const deviceType = await getDeviceType();
  if (deviceType === 'tablet') {
    const { Dimensions } = require('react-native');
    const { width, height } = Dimensions.get('window');
    const isLandscape = width > height;
    return isLandscape ? 0.35 : 0.40;
  }

  return 1.0; // Full width on phones
}

/**
 * Check if app should show split view layout
 * Based on device type and current window size
 */
export async function shouldShowSplitView(): Promise<boolean> {
  if (Platform.OS === 'ios' && RNSplitView) {
    return RNSplitView.shouldShowSplitView();
  }

  // Android fallback
  const deviceType = await getDeviceType();
  const sizeClass = await getHorizontalSizeClass();
  return deviceType === 'tablet' && sizeClass === 'regular';
}

/**
 * Hook for synchronous device type check based on screen dimensions
 * Use this for initial render, then async functions for accurate check
 */
export function useDeviceTypeSync(): 'phone' | 'tablet' {
  const { Dimensions } = require('react-native');
  const { width, height } = Dimensions.get('window');
  const diagonal = Math.sqrt(width * width + height * height);
  return diagonal > 1100 ? 'tablet' : 'phone';
}
