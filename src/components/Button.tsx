/**
 * VisionFlow AI - Button Component (v2.0 HUD Upgrade - FIXED)
 * Tactical interaction plates with glow effects and type safety
 * * @module components/Button
 */

import React from 'react';
import { View, ViewStyle, ActivityIndicator, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Text } from './Text';
import { Icon, IconProps } from './Icon';
import { Pressable } from './Pressable';

/**
 * Button variants
 * Added 'hud' for tactical/scanner actions
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'hud';

/**
 * Button sizes
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button props
 */
export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconProps['name'];
  rightIcon?: IconProps['name'];
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
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
 * Increased padding for tactical "plate" feel
 */
function getButtonPadding(size: ButtonSize): number {
  switch (size) {
    case 'small':
      return Theme.spacing.s;
    case 'medium':
      return Theme.spacing.l; // Wider for better touch target
    case 'large':
      return Theme.spacing.xl;
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
 * * @example
 * ```tsx
 * <Button label="SCAN SYSTEM" variant="hud" leftIcon="scan" />
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
  // Added shadow property for glow effects
  const getVariantStyles = (): {
    backgroundColor: string;
    textColor: string;
    borderColor?: string;
    borderWidth?: number;
    shadow?: ViewStyle;
  } => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Theme.colors.primary[500],
          textColor: '#FFFFFF',
          shadow: Theme.shadows.glow, // Electric Blue Glow
        };
        
      case 'secondary':
        return {
          backgroundColor: Theme.colors.background.tertiary, // Darker surface
          textColor: Theme.colors.text.secondary,
          borderWidth: 1,
          borderColor: Theme.colors.border.medium,
        };
        
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: Theme.colors.primary[500],
          borderColor: Theme.colors.primary[500],
          borderWidth: 1,
        };
        
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: Theme.colors.text.secondary,
        };

      case 'hud':
        // New Tactical Variant
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)', // 10% Blue tint
          textColor: Theme.colors.primary[400],
          borderColor: 'rgba(59, 130, 246, 0.5)',
          borderWidth: 1,
          shadow: Theme.shadows.sm,
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
    borderWidth: variantStyles.borderWidth || 0,
    borderColor: variantStyles.borderColor,
    ...variantStyles.shadow, // Apply glow if present
    opacity: disabled ? 0.5 : 1,
  };
  
  // Disabled state
  const isDisabled = disabled || loading;
  
  // Combine styles
  const combinedStyles: ViewStyle[] = [containerStyle];
  if (style) {
    combinedStyles.push(style);
  }
  
  return (
    <Pressable
      scaleOnPress
      pressScale={0.96}
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
            weight="700"
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
    marginHorizontal: Theme.spacing.xs,
  },
  label: {
    textAlign: 'center',
  },
});