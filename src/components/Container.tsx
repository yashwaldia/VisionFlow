/**
 * VisionFlow AI - Container Component
 * Content wrapper with consistent padding
 * 
 * @module components/Container
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

/**
 * Container padding presets
 */
export type ContainerPadding = 'none' | 'xs' | 's' | 'm' | 'l' | 'xl';

/**
 * Container props
 */
export interface ContainerProps {
  /**
   * Container content
   */
  children: React.ReactNode;
  
  /**
   * Horizontal padding preset
   */
  paddingHorizontal?: ContainerPadding;
  
  /**
   * Vertical padding preset
   */
  paddingVertical?: ContainerPadding;
  
  /**
   * Apply padding to all sides
   */
  padding?: ContainerPadding;
  
  /**
   * Center content horizontally
   */
  center?: boolean;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Get padding value from preset
 */
function getPaddingValue(preset: ContainerPadding): number {
  switch (preset) {
    case 'none':
      return 0;
    case 'xs':
      return Theme.spacing.xs;
    case 's':
      return Theme.spacing.s;
    case 'm':
      return Theme.spacing.m;
    case 'l':
      return Theme.spacing.l;
    case 'xl':
      return Theme.spacing.xl;
    default:
      return Theme.spacing.m;
  }
}

/**
 * Container Component
 * 
 * @example
 * ```tsx
 * <Container padding="m">
 *   <Text>Content with padding</Text>
 * </Container>
 * 
 * <Container paddingHorizontal="l" center>
 *   <Text>Centered content</Text>
 * </Container>
 * ```
 */
export function Container({
  children,
  paddingHorizontal,
  paddingVertical,
  padding,
  center = false,
  style,
  testID,
}: ContainerProps) {
  // Calculate padding
  const containerStyle: ViewStyle = {};
  
  if (padding) {
    containerStyle.padding = getPaddingValue(padding);
  } else {
    if (paddingHorizontal) {
      containerStyle.paddingHorizontal = getPaddingValue(paddingHorizontal);
    }
    if (paddingVertical) {
      containerStyle.paddingVertical = getPaddingValue(paddingVertical);
    }
  }
  
  // Center alignment
  if (center) {
    containerStyle.alignItems = 'center';
  }
  
  return (
    <View style={[styles.container, containerStyle, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
