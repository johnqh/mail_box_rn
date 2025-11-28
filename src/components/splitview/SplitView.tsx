/**
 * SplitView - Responsive split view component for tablets
 *
 * On tablets (width >= 768):
 * - Shows master panel on the left and detail panel on the right
 * - Supports adjustable split ratio
 * - Handles selection state
 *
 * On phones:
 * - Falls back to showing master only, with navigation to detail
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  useWindowDimensions,
  Platform,
} from 'react-native';

// Minimum width to consider as tablet (iPad mini is 768pt wide)
const TABLET_MIN_WIDTH = 768;

// Default split ratio (master panel width percentage)
const DEFAULT_MASTER_RATIO = 0.35;
const MIN_MASTER_WIDTH = 280;
const MAX_MASTER_WIDTH = 400;

export interface SplitViewProps {
  /** Master panel content (list view) */
  masterPanel: React.ReactNode;
  /** Detail panel content (detail view) */
  detailPanel: React.ReactNode;
  /** Empty state when no detail is selected */
  emptyDetailPanel?: React.ReactNode;
  /** Whether a detail item is selected */
  hasDetailSelected?: boolean;
  /** Custom master panel width (overrides ratio) */
  masterWidth?: number;
  /** Master panel ratio (0.2 - 0.5) */
  masterRatio?: number;
  /** Callback when layout changes between phone and tablet */
  onLayoutChange?: (isTablet: boolean) => void;
}

export function SplitView({
  masterPanel,
  detailPanel,
  emptyDetailPanel,
  hasDetailSelected = false,
  masterWidth: customMasterWidth,
  masterRatio = DEFAULT_MASTER_RATIO,
  onLayoutChange,
}: SplitViewProps): React.JSX.Element {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  const [isTabletLayout, setIsTabletLayout] = useState(windowWidth >= TABLET_MIN_WIDTH);

  // Handle container layout changes
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  // Update tablet state when width changes
  useEffect(() => {
    const isTablet = containerWidth >= TABLET_MIN_WIDTH;
    if (isTablet !== isTabletLayout) {
      setIsTabletLayout(isTablet);
      onLayoutChange?.(isTablet);
    }
  }, [containerWidth, isTabletLayout, onLayoutChange]);

  // Calculate master panel width
  const getMasterWidth = useCallback((): number => {
    if (customMasterWidth) {
      return Math.min(Math.max(customMasterWidth, MIN_MASTER_WIDTH), MAX_MASTER_WIDTH);
    }
    const calculated = containerWidth * masterRatio;
    return Math.min(Math.max(calculated, MIN_MASTER_WIDTH), MAX_MASTER_WIDTH);
  }, [containerWidth, customMasterWidth, masterRatio]);

  // Phone layout - show master only (navigation handles detail)
  if (!isTabletLayout) {
    return (
      <View style={styles.container} onLayout={handleLayout}>
        <View style={styles.fullWidth}>{masterPanel}</View>
      </View>
    );
  }

  // Tablet layout - show master and detail side by side
  const masterPanelWidth = getMasterWidth();

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Master Panel (Left) */}
      <View style={[styles.masterPanel, { width: masterPanelWidth }]}>
        {masterPanel}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Detail Panel (Right) */}
      <View style={styles.detailPanel}>
        {hasDetailSelected ? detailPanel : emptyDetailPanel || <DefaultEmptyState />}
      </View>
    </View>
  );
}

/**
 * Default empty state when no detail is selected
 */
function DefaultEmptyState(): React.JSX.Element {
  return (
    <View style={styles.emptyState}>
      {/* Empty state can be customized */}
    </View>
  );
}

/**
 * Hook to check if current device is in tablet layout
 */
export function useIsTabletLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_MIN_WIDTH;
}

/**
 * Hook to get current device form factor
 */
export function useDeviceFormFactor(): 'phone' | 'tablet' {
  const { width } = useWindowDimensions();
  return width >= TABLET_MIN_WIDTH ? 'tablet' : 'phone';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  fullWidth: {
    flex: 1,
  },
  masterPanel: {
    backgroundColor: Platform.select({
      ios: '#f2f2f7',
      android: '#fafafa',
    }),
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Platform.select({
      ios: '#c6c6c8',
      android: '#e0e0e0',
    }),
  },
  detailPanel: {
    flex: 1,
    backgroundColor: Platform.select({
      ios: '#ffffff',
      android: '#ffffff',
    }),
  },
  emptyState: {
    flex: 1,
    backgroundColor: Platform.select({
      ios: '#f2f2f7',
      android: '#fafafa',
    }),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
