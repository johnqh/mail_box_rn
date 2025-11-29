import { useWindowDimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const TABLET_BREAKPOINT = 768;
const LARGE_TABLET_BREAKPOINT = 1024;
const MASTER_PANE_WIDTH = 400; // Fixed width for tablet split view

export type DeviceLayout = 'phone' | 'tablet' | 'large-tablet';

export interface DeviceLayoutInfo {
  layout: DeviceLayout;
  isTablet: boolean;
  isLargeTablet: boolean;
  showSplitView: boolean;
  masterPaneWidth: number;
  screenWidth: number;
  screenHeight: number;
}

export const useDeviceLayout = (): DeviceLayoutInfo => {
  const { width, height } = useWindowDimensions();
  const isTabletDevice = DeviceInfo.isTablet();

  // Consider it a tablet if either the device is a tablet or the screen is wide enough
  const isTablet = isTabletDevice || width >= TABLET_BREAKPOINT;
  const isLargeTablet = width >= LARGE_TABLET_BREAKPOINT;

  let layout: DeviceLayout = 'phone';
  if (isLargeTablet) {
    layout = 'large-tablet';
  } else if (isTablet) {
    layout = 'tablet';
  }

  return {
    layout,
    isTablet,
    isLargeTablet,
    showSplitView: isTablet,
    masterPaneWidth: MASTER_PANE_WIDTH, // Fixed width as per design decision
    screenWidth: width,
    screenHeight: height,
  };
};

export default useDeviceLayout;
