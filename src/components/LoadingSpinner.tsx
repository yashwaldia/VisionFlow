/**
 * VisionFlow AI - LoadingSpinner Component
 * Reusable loading indicator with optional text
 * 
 * @module components/LoadingSpinner
 */

import React from 'react';
import { View, ActivityIndicator, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Text } from './Text';

/**
 * Loading spinner size
 */
export type SpinnerSize = 'small' | 'large';

/**
 * LoadingSpinner props
 */
export interface LoadingSpinnerProps {
  /**
   * Spinner size
   */
  size?: SpinnerSize;
  
  /**
   * Spinner color
   */
  color?: string;
  
  /**
   * Loading text message
   */
  text?: string;
  
  /**
   * Center in parent container
   */
  centered?: boolean;
  
  /**
   * Full screen overlay
   */
  fullScreen?: boolean;
  
  /**
   * Custom container style
   */
  style?: ViewStyle;
  
  /**
   * Test ID
   */
  testID?: string;
}

/**
 * LoadingSpinner Component
 * 
 * @example
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size="large" text="Loading reminders..." />
 * <LoadingSpinner fullScreen text="Processing image..." />
 * ```
 */
export function LoadingSpinner({
  size = 'large',
  color = Theme.colors.primary[500],
  text,
  centered = true,
  fullScreen = false,
  style,
  testID,
}: LoadingSpinnerProps) {
  // Container style based on props
  const getContainerStyle = (): ViewStyle => {
    if (fullScreen) {
      return styles.fullScreenContainer;
    }
    
    if (centered) {
      return styles.centeredContainer;
    }
    
    return styles.defaultContainer;
  };
  
  const containerStyle = getContainerStyle();
  
  // Combine styles
  const containerStyles: ViewStyle[] = [containerStyle];
  if (style) {
    containerStyles.push(style);
  }
  
  return (
    <View style={containerStyles} testID={testID}>
      <ActivityIndicator
        size={size}
        color={color}
        testID={testID ? `${testID}-spinner` : undefined}
      />
      
      {text && (
        <Text
          variant="body"
          color="secondary"
          align="center"
          style={styles.text}
        >
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.overlay,
    zIndex: Theme.zIndex.modal,
  },
  text: {
    marginTop: Theme.spacing.m,
  },
});
