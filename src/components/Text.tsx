/**
 * VisionFlow AI - Text Component (v2.2 - Italic Support Edition)
 * Themeable text component with semantic variants
 * 
 * @module components/Text
 * 
 * CHANGELOG v2.2:
 * - ✅ Added italic prop for descriptive/insight text (matches web prototype)
 * - ✅ Italic style used for secondary descriptions (Hidden Inside pattern)
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { Theme } from '../constants/theme';

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

export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  color?: TextColor;
  customColor?: string;
  weight?: '400' | '500' | '600' | '700';
  align?: 'left' | 'center' | 'right' | 'justify';
  mono?: boolean;
  /**
   * ✅ NEW: Enable italic font style
   * Use for descriptive text, insights, secondary information
   * @default false
   */
  italic?: boolean;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

function getVariantStyle(variant: TextVariant): TextStyle {
  const { typography } = Theme;
  
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
      return {
        fontSize: typography.variants.body.fontSize,
        lineHeight: typography.variants.body.lineHeight,
        fontWeight: typography.variants.body.fontWeight,
        letterSpacing: typography.variants.body.letterSpacing,
      };
  }
}

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
 * // Italic descriptive text (web prototype style)
 * <Text variant="body" color="secondary" italic>
 *   A high-precision vision kernel built to reveal...
 * </Text>
 * 
 * // Monospace technical labels
 * <Text variant="caption" mono weight="700">
 *   ACTIVE REMINDERS
 * </Text>
 * ```
 */
export function Text({
  variant = 'body',
  color = 'primary',
  customColor,
  weight,
  align = 'left',
  mono = false,
  italic = false, // ✅ NEW
  style,
  children,
  ...rest
}: TextProps) {
  const variantStyle = getVariantStyle(variant);
  const colorStyle = customColor || getColorStyle(color);
  
  const composedStyle: TextStyle = {
    ...variantStyle,
    color: colorStyle,
    textAlign: align,
    fontFamily: mono ? Theme.typography.fontFamily.mono : Theme.typography.fontFamily.primary,
    fontStyle: italic ? 'italic' : 'normal', // ✅ NEW
  };
  
  if (weight) {
    composedStyle.fontWeight = weight;
  }
  
  const finalStyle = [composedStyle, style].filter(Boolean);
  
  return (
    <RNText
      style={finalStyle}
      allowFontScaling={false}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function Heading({ children, ...props }: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="h1" {...props}>
      {children}
    </Text>
  );
}

export function Display({ children, ...props }: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="display" {...props}>
      {children}
    </Text>
  );
}

export function Caption({ children, ...props }: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="caption" {...props}>
      {children}
    </Text>
  );
}
