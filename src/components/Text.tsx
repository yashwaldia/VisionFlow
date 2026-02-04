/**
 * VisionFlow AI - Text Component (v2.1 - Harmonized Edition)
 * Themeable text component with semantic variants
 * 
 * @module components/Text
 * 
 * CHANGELOG v2.1:
 * - Now uses Theme.typography.variants for consistency
 * - Simplified variant style logic
 * - All headers use standardized font weights
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { Theme } from '../constants/theme';

/**
 * Text variant types
 */
export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bodyLarge'
  | 'body'
  | 'caption'
  | 'micro';

/**
 * Text color presets
 */
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse';

/**
 * Text component props
 */
export interface TextProps extends Omit<RNTextProps, 'style'> {
  /**
   * Text variant (defines size, weight, line height)
   */
  variant?: TextVariant;
  
  /**
   * Text color preset
   */
  color?: TextColor;
  
  /**
   * Custom color (overrides color preset)
   */
  customColor?: string;
  
  /**
   * Font weight override
   * NOTE: Only use this if you MUST override the variant's default weight
   */
  weight?: '400' | '500' | '600' | '700';
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * Enable monospace font (for timestamps, code)
   */
  mono?: boolean;
  
  /**
   * Additional custom styles
   */
  style?: TextStyle | TextStyle[];
  
  /**
   * Text content
   */
  children: React.ReactNode;
}

/**
 * Get text style for variant
 * Now uses the centralized Typography.variants from theme
 */
function getVariantStyle(variant: TextVariant): TextStyle {
  const { typography } = Theme;
  
  // Use the new variants from theme.ts
  switch (variant) {
    case 'display':
      return {
        fontSize: typography.variants.display.fontSize,
        lineHeight: typography.variants.display.lineHeight,
        fontWeight: typography.variants.display.fontWeight,
        letterSpacing: typography.variants.display.letterSpacing,
      };
      
    case 'h1':
      return {
        fontSize: typography.variants.h1.fontSize,
        lineHeight: typography.variants.h1.lineHeight,
        fontWeight: typography.variants.h1.fontWeight,
        letterSpacing: typography.variants.h1.letterSpacing,
      };
      
    case 'h2':
      return {
        fontSize: typography.variants.h2.fontSize,
        lineHeight: typography.variants.h2.lineHeight,
        fontWeight: typography.variants.h2.fontWeight,
        letterSpacing: typography.variants.h2.letterSpacing,
      };
      
    case 'h3':
      return {
        fontSize: typography.variants.h3.fontSize,
        lineHeight: typography.variants.h3.lineHeight,
        fontWeight: typography.variants.h3.fontWeight,
        letterSpacing: typography.variants.h3.letterSpacing,
      };
      
    case 'h4':
      return {
        fontSize: typography.variants.h4.fontSize,
        lineHeight: typography.variants.h4.lineHeight,
        fontWeight: typography.variants.h4.fontWeight,
        letterSpacing: typography.variants.h4.letterSpacing,
      };
      
    case 'bodyLarge':
      return {
        fontSize: typography.variants.bodyLarge.fontSize,
        lineHeight: typography.variants.bodyLarge.lineHeight,
        fontWeight: typography.variants.bodyLarge.fontWeight,
        letterSpacing: typography.variants.bodyLarge.letterSpacing,
      };
      
    case 'body':
      return {
        fontSize: typography.variants.body.fontSize,
        lineHeight: typography.variants.body.lineHeight,
        fontWeight: typography.variants.body.fontWeight,
        letterSpacing: typography.variants.body.letterSpacing,
      };
      
    case 'caption':
      return {
        fontSize: typography.variants.caption.fontSize,
        lineHeight: typography.variants.caption.lineHeight,
        fontWeight: typography.variants.caption.fontWeight,
        letterSpacing: typography.variants.caption.letterSpacing,
      };
      
    case 'micro':
      return {
        fontSize: typography.variants.micro.fontSize,
        lineHeight: typography.variants.micro.lineHeight,
        fontWeight: typography.variants.micro.fontWeight,
        letterSpacing: typography.variants.micro.letterSpacing,
      };
      
    default:
      // Fallback to body
      return {
        fontSize: typography.variants.body.fontSize,
        lineHeight: typography.variants.body.lineHeight,
        fontWeight: typography.variants.body.fontWeight,
        letterSpacing: typography.variants.body.letterSpacing,
      };
  }
}

/**
 * Get color for color preset
 */
function getColorStyle(colorPreset: TextColor): string {
  const { text } = Theme.colors;
  
  switch (colorPreset) {
    case 'primary':
      return text.primary;
    case 'secondary':
      return text.secondary;
    case 'tertiary':
      return text.tertiary;
    case 'disabled':
      return text.disabled;
    case 'inverse':
      return text.inverse;
    default:
      return text.primary;
  }
}

/**
 * Text Component
 * 
 * @example
 * ```tsx
 * // Screen titles - always use h2
 * <Text variant="h2">Reminders</Text>
 * 
 * // Large feature titles - rare, only for Home
 * <Text variant="h1">VisionFlow AI</Text>
 * 
 * // Section headers
 * <Text variant="h3">Quick Actions</Text>
 * 
 * // Body text
 * <Text variant="body" color="secondary">Description text</Text>
 * 
 * // Small metadata
 * <Text variant="caption" color="tertiary">2 days ago</Text>
 * 
 * // Tiny badges/labels
 * <Text variant="micro">NEW</Text>
 * ```
 */
export function Text({
  variant = 'body',
  color = 'primary',
  customColor,
  weight,
  align = 'left',
  mono = false,
  style,
  children,
  ...rest
}: TextProps) {
  // Build style object
  const variantStyle = getVariantStyle(variant);
  const colorStyle = customColor || getColorStyle(color);
  
  const composedStyle: TextStyle = {
    ...variantStyle,
    color: colorStyle,
    textAlign: align,
    fontFamily: mono ? Theme.typography.fontFamily.mono : Theme.typography.fontFamily.primary,
  };
  
  // Override font weight if provided (use sparingly!)
  if (weight) {
    composedStyle.fontWeight = weight;
  }
  
  // Merge with custom styles
  const finalStyle = [composedStyle, style].filter(Boolean);
  
  return (
    <RNText
      style={finalStyle}
      allowFontScaling={false} // Prevent system font scaling for consistent design
      {...rest}
    >
      {children}
    </RNText>
  );
}

/**
 * Heading component (h1 variant shorthand)
 */
export function Heading({ children, ...props }: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="h1" {...props}>
      {children}
    </Text>
  );
}

/**
 * Display text component (display variant shorthand)
 */
export function Display({ children, ...props }: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="display" {...props}>
      {children}
    </Text>
  );
}

/**
 * Caption component (caption variant shorthand)
 */
export function Caption({ children, ...props }: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="caption" {...props}>
      {children}
    </Text>
  );
}
