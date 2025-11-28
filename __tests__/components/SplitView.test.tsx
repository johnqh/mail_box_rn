/**
 * Tests for SplitView component
 *
 * Tests the responsive split view behavior for tablet/phone layouts
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock useWindowDimensions before importing component
const mockUseWindowDimensions = jest.fn();
jest.spyOn(require('react-native'), 'useWindowDimensions').mockImplementation(mockUseWindowDimensions);

import { SplitView, useIsTabletLayout, useDeviceFormFactor } from '../../src/components/splitview';

describe('SplitView', () => {
  const MasterPanel = () => <Text testID="master">Master</Text>;
  const DetailPanel = () => <Text testID="detail">Detail</Text>;
  const EmptyDetail = () => <Text testID="empty">Empty</Text>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to phone dimensions
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });
  });

  it('should render master panel only on phone', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });

    const { getByTestId, queryByTestId } = render(
      <SplitView
        masterPanel={<MasterPanel />}
        detailPanel={<DetailPanel />}
      />
    );

    expect(getByTestId('master')).toBeTruthy();
    // Detail panel should not be rendered on phone
    expect(queryByTestId('detail')).toBeNull();
  });

  it('should render both panels on tablet', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 1024, height: 768 });

    const { getByTestId } = render(
      <SplitView
        masterPanel={<MasterPanel />}
        detailPanel={<DetailPanel />}
        hasDetailSelected={true}
      />
    );

    expect(getByTestId('master')).toBeTruthy();
    expect(getByTestId('detail')).toBeTruthy();
  });

  it('should show empty state when no detail selected on tablet', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 1024, height: 768 });

    const { getByTestId, queryByTestId } = render(
      <SplitView
        masterPanel={<MasterPanel />}
        detailPanel={<DetailPanel />}
        emptyDetailPanel={<EmptyDetail />}
        hasDetailSelected={false}
      />
    );

    expect(getByTestId('master')).toBeTruthy();
    expect(queryByTestId('detail')).toBeNull();
    expect(getByTestId('empty')).toBeTruthy();
  });

  it('should have correct default structure', () => {
    const { UNSAFE_root } = render(
      <SplitView
        masterPanel={<MasterPanel />}
        detailPanel={<DetailPanel />}
      />
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('useIsTabletLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false for phone width', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });

    const TestComponent = () => {
      const isTablet = useIsTabletLayout();
      return <Text testID="result">{isTablet ? 'tablet' : 'phone'}</Text>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('result').props.children).toBe('phone');
  });

  it('should return true for tablet width', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 1024, height: 768 });

    const TestComponent = () => {
      const isTablet = useIsTabletLayout();
      return <Text testID="result">{isTablet ? 'tablet' : 'phone'}</Text>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('result').props.children).toBe('tablet');
  });
});

describe('useDeviceFormFactor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return phone for small screens', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });

    const TestComponent = () => {
      const formFactor = useDeviceFormFactor();
      return <Text testID="result">{formFactor}</Text>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('result').props.children).toBe('phone');
  });

  it('should return tablet for large screens', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 1024, height: 768 });

    const TestComponent = () => {
      const formFactor = useDeviceFormFactor();
      return <Text testID="result">{formFactor}</Text>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('result').props.children).toBe('tablet');
  });
});
