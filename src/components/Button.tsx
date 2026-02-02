/**
 * VisionFlow AI - Button Component
 * Primary interaction component with variants
 * 
 * @module components/Button
 */

import React from 'react';
import { View, ViewStyle, ActivityIndicator, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Text } from './Text';
import { Icon, IconProps } from './Icon';
import { Pressable } from './Pressable';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Button sizes
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button props
 */
export interface ButtonProps {
  /**
   * Button label
   */
  label: string;
  
  /**
   * Button variant
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   */
  size?: ButtonSize;
  
  /**
   * Left icon name
   */
  leftIcon?: IconProps['name'];
  
  /**
   * Right icon name
   */
  rightIcon?: IconProps['name'];
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * Press handler
   */
  onPress?: () => void;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Test ID
   */
  testID?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Get button height from size
 */
function getButtonHeight(size: ButtonSize): number {
  const { button } = Theme.dimensions;
  
  switch (size) {
    case 'small':
      return button.small;
    case 'medium':
      return button.medium;
    case 'large':
      return button.large;
    default:
      return button.medium;
  }
}

/**
 * Get button padding from size
 */
function getButtonPadding(size: ButtonSize): number {
  switch (size) {
    case 'small':
      return Theme.spacing.s;
    case 'medium':
      return Theme.spacing.m;
    case 'large':
      return Theme.spacing.l;
    default:
      return Theme.spacing.m;
  }
}

/**
 * Get text variant from button size
 */
function getTextVariant(size: ButtonSize): 'body' | 'bodyLarge' | 'caption' {
  switch (size) {
    case 'small':
      return 'caption';
    case 'medium':
      return 'body';
    case 'large':
      return 'bodyLarge';
    default:
      return 'body';
  }
}

/**
 * Button Component
 * 
 * @example
 * ```tsx
 * <Button label="Capture Image" variant="primary" leftIcon="camera" onPress={handleCapture} />
 * <Button label="Cancel" variant="ghost" size="small" onPress={handleCancel} />
 * <Button label="Loading..." variant="primary" loading />
 * ```
 */
export function Button({
  label,
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  // Calculate dimensions
  const height = getButtonHeight(size);
  const paddingHorizontal = getButtonPadding(size);
  const textVariant = getTextVariant(size);
  const iconSize: 'xs' | 'sm' | 'md' = size === 'small' ? 'xs' : size === 'medium' ? 'sm' : 'md';
  
  // Get colors based on variant
  const getVariantStyles = (): {
    backgroundColor: string;
    textColor: string;
    borderColor?: string;
    borderWidth?: number;
  } => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Theme.colors.primary[500],
          textColor: Theme.colors.text.primary,
        };
        
      case 'secondary':
        return {
          backgroundColor: Theme.colors.background.secondary,
          textColor: Theme.colors.text.primary,
        };
        
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: Theme.colors.primary[500],
          borderColor: Theme.colors.border.medium,
          borderWidth: 1,
        };
        
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: Theme.colors.text.secondary,
        };
        
      default:
        return {
          backgroundColor: Theme.colors.primary[500],
          textColor: Theme.colors.text.primary,
        };
    }
  };
  
  const variantStyles = getVariantStyles();
  
  // Container style
  const containerStyle: ViewStyle = {
    height,
    paddingHorizontal,
    backgroundColor: variantStyles.backgroundColor,
    borderRadius: Theme.borderRadius.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    borderWidth: variantStyles.borderWidth,
    borderColor: variantStyles.borderColor,
    ...Theme.shadows.sm,
  };
  
  // Disabled state
  const isDisabled = disabled || loading;
  
  // Combine styles - FIXED: Proper handling of optional style prop
  const combinedStyles: ViewStyle[] = [containerStyle];
  if (style) {
    combinedStyles.push(style);
  }
  
  return (
    <Pressable
      scaleOnPress
      pressScale={0.98}
      haptic="light"
      onPress={onPress}
      disabled={isDisabled}
      style={combinedStyles}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
          testID={`${testID}-loading`}
        />
      ) : (
        <>
          {leftIcon && (
            <View style={styles.iconContainer}>
              <Icon
                name={leftIcon}
                size={iconSize}
                color={variantStyles.textColor}
              />
            </View>
          )}
          
          <Text
            variant={textVariant}
            customColor={variantStyles.textColor}
            weight="600"
            style={styles.label}
          >
            {label}
          </Text>
          
          {rightIcon && (
            <View style={styles.iconContainer}>
              <Icon
                name={rightIcon}
                size={iconSize}
                color={variantStyles.textColor}
              />
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    marginHorizontal: Theme.spacing.xxs,
  },
  label: {
    textAlign: 'center',
  },
});
