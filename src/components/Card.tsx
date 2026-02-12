/**
 * VisionFlow AI - Card Component (v2.2 - Enhanced Glow Edition)
 * Tactical surfaces with glassmorphism and stronger blue glow
 * Matches Hidden Inside web prototype
 * 
 * @module components/Card
 * 
 * CHANGELOG v2.2:
 * - ✅ Enhanced blue glow borders (50% opacity instead of generic)
 * - ✅ Stronger glow shadow effect for active/HUD elements
 * - ✅ Added 'glowBorder' variant for emphasized cards
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Pressable } from './Pressable';

export type CardElevation = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow';

export type CardVariant = 'default' | 'outlined' | 'glass' | 'hud' | 'glowBorder';

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
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  active?: boolean;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
}

function getShadowStyle(elevation: CardElevation): ViewStyle {
  switch (elevation) {
    case 'none': return Theme.shadows.none;
    case 'sm': return Theme.shadows.sm;
    case 'md': return Theme.shadows.md;
    case 'lg': return Theme.shadows.lg;
    case 'xl': return Theme.shadows.xl;
    case 'glow': return {
      // ✅ ENHANCED: Stronger glow effect
      shadowColor: Theme.colors.primary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6, // Increased from 0.4
      shadowRadius: 15, // Increased from 10
      elevation: 8,
    };
    default: return Theme.shadows.sm;
  }
}

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
  pointerEvents = 'auto',
}: CardProps) {
  
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
        return {
          backgroundColor: backgroundColor || Theme.colors.background.tertiary,
          borderWidth: 1,
          borderColor: borderColor || Theme.colors.border.default,
        };
      
      // ✅ NEW: Glow border variant (matches web prototype)
      case 'glowBorder':
        return {
          backgroundColor: backgroundColor || Theme.colors.background.secondary,
          borderWidth: 1.5,
          borderColor: borderColor || `${Theme.colors.primary[500]}80`, // 50% opacity blue
          ...Theme.shadows.glow,
        };
        
      default:
        return {
          backgroundColor: Theme.colors.background.secondary,
        };
    }
  };
  
  const variantStyle = getVariantStyle();
  const shadowStyle = getShadowStyle(elevation);
  
  // ✅ ENHANCED: Active state with stronger blue emphasis
  const activeStyle: ViewStyle = active ? {
    borderColor: `${Theme.colors.primary[500]}CC`, // 80% opacity
    borderWidth: 1.5, // Thicker border
    backgroundColor: variant === 'glass' 
      ? Theme.glassmorphism.tint 
      : `${Theme.colors.background.tertiary}`,
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  } : {};

  const cardStyle: ViewStyle = {
    borderRadius,
    padding,
    overflow: 'hidden',
    ...variantStyle,
    ...shadowStyle,
    ...activeStyle,
  };
  
  const combinedStyles: ViewStyle[] = [cardStyle];
  if (style) {
    if (Array.isArray(style)) {
      combinedStyles.push(...style);
    } else {
      combinedStyles.push(style);
    }
  }
  
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
    <View 
      style={combinedStyles} 
      testID={testID}
      pointerEvents={pointerEvents}
    >
      {children}
    </View>
  );
}
