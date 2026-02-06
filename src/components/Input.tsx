/**
 * VisionFlow AI - Input Component (v2.2 - Universal Keyboard Fix)
 * Data entry fields with terminal aesthetics and focus glow
 * 
 * @module components/Input
 * 
 * CHANGELOG v2.2:
 * - 🐛 FIXED: Keyboard now stays open in ALL screens (modals, forms, everywhere)
 * - 🐛 FIXED: pointerEvents="box-none" prevents touch event capture
 * - 🐛 FIXED: Icons don't interfere with TextInput focus
 * - 🐛 FIXED: Text rendering error with proper style handling
 * - ✅ Full ref support for keyboard navigation
 * - ✅ All TextInput props pass through correctly
 */

import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  ViewStyle,
  TextStyle,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Theme } from '../constants/theme';
import { Text } from './Text';
import { Icon, IconProps } from './Icon';
import { Pressable } from './Pressable';

/**
 * Input props
 */
export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  leftIcon?: IconProps['name'];
  rightIcon?: IconProps['name'];
  onRightIconPress?: () => void;
  disabled?: boolean;
  secureTextEntry?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
}

/**
 * Input Component
 * "Terminal Data Entry" Style
 * ✅ Now works perfectly in ALL screens - modals, forms, everywhere!
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      disabled = false,
      secureTextEntry = false,
      containerStyle,
      inputStyle,
      testID,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = secureTextEntry;
    const actualSecureTextEntry = isPassword && !showPassword;

    const getBorderColor = () => {
      if (error) return Theme.colors.semantic.error;
      if (isFocused) return Theme.colors.primary[500];
      return Theme.colors.border.default;
    };

    const inputContainerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      height: Theme.dimensions.input.default,
      backgroundColor: Theme.colors.background.tertiary,
      borderRadius: Theme.borderRadius.m,
      borderWidth: 1,
      borderColor: getBorderColor(),
      paddingHorizontal: Theme.spacing.m,
      opacity: disabled ? Theme.opacity.disabled : 1,
      ...(isFocused ? Theme.shadows.glow : {}),
    };

    const textInputStyle: TextStyle = {
      flex: 1,
      fontSize: Theme.typography.fontSize.body,
      fontFamily: Theme.typography.fontFamily.mono,
      lineHeight: Theme.typography.lineHeight.body,
      color: Theme.colors.text.primary,
      paddingVertical: 0,
    };

    return (
      <View 
        style={containerStyle} 
        testID={testID}
        pointerEvents="box-none"
      >
        {/* Label */}
        {label && (
          <Text
            variant="caption"
            color="secondary"
            weight="700"
            style={styles.label}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View 
          style={inputContainerStyle}
          pointerEvents="box-none"
        >
          {/* Left Icon */}
          {leftIcon && (
            <View pointerEvents="none">
              <Icon
                name={leftIcon}
                size="sm"
                color={
                  isFocused
                    ? Theme.colors.primary[500]
                    : Theme.colors.text.tertiary
                }
                accessibilityLabel={label ? `${label} icon` : 'input icon'}
              />
            </View>
          )}

          {/* TextInput */}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Theme.colors.text.tertiary}
            secureTextEntry={actualSecureTextEntry}
            editable={!disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            selectionColor={Theme.colors.primary[500]}
            style={[
              textInputStyle,
              leftIcon && { marginLeft: Theme.spacing.s },
              (rightIcon || isPassword) && { marginRight: Theme.spacing.s },
              inputStyle,
            ]}
            testID={testID ? `${testID}-input` : undefined}
            {...rest}
          />

          {/* Right Icon or Password Toggle */}
          {isPassword ? (
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              haptic="light"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size="sm"
                color={Theme.colors.text.tertiary}
              />
            </Pressable>
          ) : rightIcon ? (
            <Pressable
              onPress={onRightIconPress}
              haptic="light"
              disabled={!onRightIconPress}
            >
              <Icon
                name={rightIcon}
                size="sm"
                color={Theme.colors.text.tertiary}
              />
            </Pressable>
          ) : null}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon
              name="alert-circle-outline"
              size="xs"
              color={Theme.colors.semantic.error}
            />
            <Text
              variant="caption"
              customColor={Theme.colors.semantic.error}
              style={styles.errorText}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <Text 
            variant="caption" 
            color="tertiary" 
            style={styles.helperText}
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helperText: {
    marginTop: Theme.spacing.xxs,
    marginLeft: Theme.spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xxs,
    marginLeft: Theme.spacing.xs,
  },
  errorText: {
    marginLeft: 4,
  },
});
