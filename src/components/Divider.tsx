/**
 * VisionFlow AI - Divider Component
 * Visual separator between sections
 * 
 * @module components/Divider
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Text } from './Text';

/**
 * Divider orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Divider props
 */
export interface DividerProps {
  /**
   * Divider orientation
   */
  orientation?: DividerOrientation;
  
  /**
   * Divider thickness (in pixels)
   */
  thickness?: number;
  
  /**
   * Divider color
   */
  color?: string;
  
  /**
   * Spacing around divider
   */
  spacing?: number;
  
  /**
   * Optional label text
   */
  label?: string;
  
  /**
   * Label position (for horizontal dividers)
   */
  labelPosition?: 'left' | 'center' | 'right';
  
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
 * Divider Component
 * 
 * @example
 * ```tsx
 * <Divider />
 * <Divider label="OR" labelPosition="center" />
 * <Divider orientation="vertical" />
 * <Divider color={Theme.colors.primary} thickness={2} />
 * ```
 */
export function Divider({
  orientation = 'horizontal',
  thickness = 1,
  color = Theme.colors.border.medium,
  spacing = Theme.spacing.m,
  label,
  labelPosition = 'center',
  style,
  testID,
}: DividerProps) {
  // Horizontal divider with label
  if (orientation === 'horizontal' && label) {
    return (
      <View
        style={[
          styles.labelContainer,
          {
            marginVertical: spacing,
          },
          style,
        ]}
        testID={testID}
      >
        {/* Left line */}
        {(labelPosition === 'center' || labelPosition === 'right') && (
          <View
            style={[
              styles.line,
              {
                height: thickness,
                backgroundColor: color,
                flex: labelPosition === 'center' ? 1 : 0.3,
              },
            ]}
          />
        )}
        
        {/* Label */}
        <Text
          variant="caption"
          color="secondary"
          style={[
            styles.label,
            {
              marginHorizontal: Theme.spacing.s,
            },
          ]}
        >
          {label}
        </Text>
        
        {/* Right line */}
        {(labelPosition === 'center' || labelPosition === 'left') && (
          <View
            style={[
              styles.line,
              {
                height: thickness,
                backgroundColor: color,
                flex: labelPosition === 'center' ? 1 : 0.3,
              },
            ]}
          />
        )}
      </View>
    );
  }
  
  // Horizontal divider without label
  if (orientation === 'horizontal') {
    return (
      <View
        style={[
          styles.line,
          {
            height: thickness,
            backgroundColor: color,
            marginVertical: spacing,
          },
          style,
        ]}
        testID={testID}
      />
    );
  }
  
  // Vertical divider
  return (
    <View
      style={[
        styles.line,
        {
          width: thickness,
          backgroundColor: color,
          marginHorizontal: spacing,
        },
        style,
      ]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    backgroundColor: Theme.colors.border.medium,
  },
  label: {
    textTransform: 'uppercase',
  },
});
