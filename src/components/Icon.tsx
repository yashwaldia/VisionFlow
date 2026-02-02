/**
 * VisionFlow AI - Icon Component
 * Centralized icon system with theme integration
 * 
 * @module components/Icon
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';

/**
 * Icon size presets
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon component props
 */
export interface IconProps {
  /**
   * Icon name from Ionicons
   * @see https://icons.expo.fyi/Index
   */
  name: keyof typeof Ionicons.glyphMap;
  
  /**
   * Icon size preset
   */
  size?: IconSize;
  
  /**
   * Custom size (overrides size preset)
   */
  customSize?: number;
  
  /**
   * Icon color
   */
  color?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Get icon size from preset
 */
function getIconSize(size: IconSize): number {
  const { icon } = Theme.dimensions;
  
  switch (size) {
    case 'xs':
      return icon.xs;
    case 'sm':
      return icon.sm;
    case 'md':
      return icon.md;
    case 'lg':
      return icon.lg;
    case 'xl':
      return icon.xl;
    default:
      return icon.md;
  }
}

/**
 * Icon Component
 * 
 * @example
 * ```tsx
 * <Icon name="camera" size="lg" color={Theme.colors.primary} />
 * <Icon name="checkmark-circle" customSize={32} color="#10B981" />
 * ```
 */
export function Icon({
  name,
  size = 'md',
  customSize,
  color = Theme.colors.text.primary,
  accessibilityLabel,
  testID,
}: IconProps) {
  const iconSize = customSize || getIconSize(size);
  
  return (
    <Ionicons
      name={name}
      size={iconSize}
      color={color}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    />
  );
}
