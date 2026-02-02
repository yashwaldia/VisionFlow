/**
 * VisionFlow AI - Text Component
 * Themeable text component with semantic variants
 * 
 * @module components/Text
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
 */
function getVariantStyle(variant: TextVariant): TextStyle {
  const { typography } = Theme;
  
  switch (variant) {
    case 'display':
      return {
        fontSize: typography.fontSize.display,
        lineHeight: typography.lineHeight.display,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
      };
      
    case 'h1':
      return {
        fontSize: typography.fontSize.h1,
        lineHeight: typography.lineHeight.h1,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
      };
      
    case 'h2':
      return {
        fontSize: typography.fontSize.h2,
        lineHeight: typography.lineHeight.h2,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.tight,
      };
      
    case 'h3':
      return {
        fontSize: typography.fontSize.h3,
        lineHeight: typography.lineHeight.h3,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.normal,
      };
      
    case 'h4':
      return {
        fontSize: typography.fontSize.h4,
        lineHeight: typography.lineHeight.h4,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.normal,
      };
      
    case 'bodyLarge':
      return {
        fontSize: typography.fontSize.bodyLarge,
        lineHeight: typography.lineHeight.bodyLarge,
        fontWeight: typography.fontWeight.regular,
        letterSpacing: typography.letterSpacing.normal,
      };
      
    case 'body':
      return {
        fontSize: typography.fontSize.body,
        lineHeight: typography.lineHeight.body,
        fontWeight: typography.fontWeight.regular,
        letterSpacing: typography.letterSpacing.normal,
      };
      
    case 'caption':
      return {
        fontSize: typography.fontSize.caption,
        lineHeight: typography.lineHeight.caption,
        fontWeight: typography.fontWeight.medium,
        letterSpacing: typography.letterSpacing.wide,
      };
      
    case 'micro':
      return {
        fontSize: typography.fontSize.micro,
        lineHeight: typography.lineHeight.micro,
        fontWeight: typography.fontWeight.medium,
        letterSpacing: typography.letterSpacing.wide,
      };
      
    default:
      return {
        fontSize: typography.fontSize.body,
        lineHeight: typography.lineHeight.body,
        fontWeight: typography.fontWeight.regular,
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
 * <Text variant="h1">Welcome to VisionFlow AI</Text>
 * <Text variant="body" color="secondary">Subtitle text</Text>
 * <Text variant="caption" customColor="#6366F1">Custom color</Text>
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
  
  // Override font weight if provided
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
