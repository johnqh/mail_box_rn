import React from 'react';
import { useDeviceLayout } from '../hooks/useDeviceLayout';
import PhoneNavigator from './PhoneNavigator';
import TabletNavigator from './TabletNavigator';

/**
 * MainNavigator - Adaptive navigator that switches between
 * phone and tablet layouts based on device type and screen size.
 */
export const MainNavigator: React.FC = () => {
  const { showSplitView } = useDeviceLayout();

  // Show split view on tablets, bottom tabs on phones
  return showSplitView ? <TabletNavigator /> : <PhoneNavigator />;
};

export default MainNavigator;
