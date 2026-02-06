/**
 * VisionFlow AI - Container Component (v2.0 - Keyboard Support)
 * Content wrapper with consistent padding
 * 
 * @module components/Container
 * 
 * CHANGELOG v2.0:
 * - ✅ Added pointerEvents support for keyboard interaction
 * - ✅ Proper touch event propagation for forms
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
  
  /**
   * Touch event handling
   * Use 'box-none' for containers with inputs to allow keyboard interaction
   * @default 'auto'
   */
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
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
 * ✅ Now supports pointerEvents for proper keyboard handling in forms
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
 * 
 * <Container padding="m" pointerEvents="box-none">
 *   <Input /> {/* Keyboard will work properly *\/}
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
  pointerEvents = 'auto',
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
    <View 
      style={[styles.container, containerStyle, style]} 
      testID={testID}
      pointerEvents={pointerEvents}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});