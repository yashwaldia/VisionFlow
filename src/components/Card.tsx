/**
 * VisionFlow AI - Card Component (v2.0 HUD Upgrade)
 * Tactical surfaces with glassmorphism and scanline support
 * * @module components/Card
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Pressable } from './Pressable';

/**
 * Card elevation levels
 * Added 'glow' for HUD elements
 */
export type CardElevation = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow';

/**
 * Card variants
 * Added 'hud' for tactical data blocks
 */
export type CardVariant = 'default' | 'outlined' | 'glass' | 'hud';

/**
 * Card props
 */
export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  elevation?: CardElevation;
  pressable?: boolean;
  onPress?: () => void;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  style?: ViewStyle | ViewStyle[]; // ✅ Accept array or single style
  testID?: string;
  /**
   * If true, applies a subtle active state border/glow
   */
  active?: boolean;
}

/**
 * Get shadow style from elevation
 */
function getShadowStyle(elevation: CardElevation): ViewStyle {
  switch (elevation) {
    case 'none': return Theme.shadows.none;
    case 'sm': return Theme.shadows.sm;
    case 'md': return Theme.shadows.md;
    case 'lg': return Theme.shadows.lg;
    case 'xl': return Theme.shadows.xl;
    case 'glow': return Theme.shadows.glow;
    default: return Theme.shadows.sm;
  }
}

/**
 * Card Component
 */
export function Card({
  children,
  variant = 'default',
  elevation = 'sm',
  pressable = false,
  onPress,
  backgroundColor,
  borderColor,
  borderRadius = Theme.borderRadius.l,
  padding = Theme.spacing.m,
  active = false,
  style,
  testID,
}: CardProps) {
  
  // Get variant-specific styles
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: backgroundColor || Theme.colors.background.secondary,
          borderWidth: 0,
        };
        
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: borderColor || Theme.colors.border.medium,
        };
        
      case 'glass':
        return {
          backgroundColor: backgroundColor || Theme.glassmorphism.tint,
          borderWidth: Theme.glassmorphism.borderWidth,
          borderColor: borderColor || Theme.glassmorphism.borderColor,
        };

      case 'hud':
        // Tactical opaque block with thin borders
        return {
          backgroundColor: backgroundColor || Theme.colors.background.tertiary,
          borderWidth: 1,
          borderColor: borderColor || Theme.colors.border.default,
        };
        
      default:
        return {
          backgroundColor: Theme.colors.background.secondary,
        };
    }
  };
  
  const variantStyle = getVariantStyle();
  const shadowStyle = getShadowStyle(elevation);
  
  // Active State Styling (e.g. selected item)
  const activeStyle: ViewStyle = active ? {
    borderColor: Theme.colors.border.active,
    borderWidth: 1,
    backgroundColor: variant === 'glass' 
      ? Theme.glassmorphism.tint 
      : Theme.colors.background.tertiary,
    ...Theme.shadows.glow, // Add glow when active
  } : {};

  // Base card style
  const cardStyle: ViewStyle = {
    borderRadius,
    padding,
    overflow: 'hidden',
    ...variantStyle,
    ...shadowStyle,
    ...activeStyle,
  };
  
  // Combine styles
  const combinedStyles: ViewStyle[] = [cardStyle];
  if (style) {
    // ✅ Handle both array and single style
    if (Array.isArray(style)) {
      combinedStyles.push(...style);
    } else {
      combinedStyles.push(style);
    }
  }

  
  // Render pressable or static card
  if (pressable && onPress) {
    return (
      <Pressable
        scaleOnPress
        pressScale={0.98}
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