/**
 * VisionFlow AI - Card Component
 * Elevated surface with glassmorphism effect
 * 
 * @module components/Card
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Pressable } from './Pressable';

/**
 * Card elevation levels
 */
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card variants
 */
export type CardVariant = 'default' | 'outlined' | 'glass';

/**
 * Card props
 */
export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Card variant
   */
  variant?: CardVariant;
  
  /**
   * Shadow elevation
   */
  elevation?: CardElevation;
  
  /**
   * Enable press interaction
   */
  pressable?: boolean;
  
  /**
   * Press handler (only works if pressable=true)
   */
  onPress?: () => void;
  
  /**
   * Background color override
   */
  backgroundColor?: string;
  
  /**
   * Border radius override
   */
  borderRadius?: number;
  
  /**
   * Padding inside card
   */
  padding?: number;
  
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
 * Get shadow style from elevation
 */
function getShadowStyle(elevation: CardElevation): ViewStyle {
  switch (elevation) {
    case 'none':
      return {};
    case 'sm':
      return Theme.shadows.sm;
    case 'md':
      return Theme.shadows.md;
    case 'lg':
      return Theme.shadows.lg;
    default:
      return Theme.shadows.sm;
  }
}

/**
 * Card Component
 * 
 * @example
 * ```tsx
 * <Card>
 *   <Text>Simple card</Text>
 * </Card>
 * 
 * <Card pressable onPress={() => console.log('Pressed')} elevation="md">
 *   <Text>Pressable card</Text>
 * </Card>
 * 
 * <Card variant="glass" elevation="lg">
 *   <Text>Glassmorphism card</Text>
 * </Card>
 * ```
 */
export function Card({
  children,
  variant = 'default',
  elevation = 'sm',
  pressable = false,
  onPress,
  backgroundColor,
  borderRadius = Theme.borderRadius.l,
  padding = Theme.spacing.m,
  style,
  testID,
}: CardProps) {
  // Get variant-specific styles
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: backgroundColor || Theme.colors.background.secondary,
        };
        
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Theme.colors.border.medium,
        };
        
      case 'glass':
        return {
          backgroundColor: `${Theme.colors.background.secondary}CC`, // 80% opacity
          borderWidth: 1,
          borderColor: `${Theme.colors.border.light}40`, // 25% opacity
          // Note: backdropFilter is web-only, removed for React Native compatibility
        };
        
      default:
        return {
          backgroundColor: Theme.colors.background.secondary,
        };
    }
  };
  
  const variantStyle = getVariantStyle();
  const shadowStyle = getShadowStyle(elevation);
  
  // Base card style
  const cardStyle: ViewStyle = {
    borderRadius,
    padding,
    overflow: 'hidden',
    ...variantStyle,
    ...shadowStyle,
  };
  
  // Combine styles - FIXED: Proper handling of optional style prop
  const combinedStyles: ViewStyle[] = [cardStyle];
  if (style) {
    combinedStyles.push(style);
  }
  
  // Render pressable or static card
  if (pressable && onPress) {
    return (
      <Pressable
        scaleOnPress
        pressScale={0.99}
        haptic="light"
        onPress={onPress}
        style={combinedStyles}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }
  
  return (
    <View style={combinedStyles} testID={testID}>
      {children}
    </View>
  );
}
