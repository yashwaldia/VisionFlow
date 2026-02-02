/**
 * VisionFlow AI - Input Component
 * Text input with validation and error states
 * 
 * @module components/Input
 */

import React, { useState } from 'react';
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
  /**
   * Input label
   */
  label?: string;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Input value
   */
  value: string;
  
  /**
   * Change handler
   */
  onChangeText: (text: string) => void;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Helper text (below input)
   */
  helperText?: string;
  
  /**
   * Left icon
   */
  leftIcon?: IconProps['name'];
  
  /**
   * Right icon
   */
  rightIcon?: IconProps['name'];
  
  /**
   * Right icon press handler
   */
  onRightIconPress?: () => void;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Secure text entry (password)
   */
  secureTextEntry?: boolean;
  
  /**
   * Container style
   */
  containerStyle?: ViewStyle;
  
  /**
   * Input style
   */
  inputStyle?: TextStyle;
  
  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Input Component
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   leftIcon="mail"
 *   error={emailError}
 * />
 * 
 * <Input
 *   label="Password"
 *   placeholder="Enter password"
 *   value={password}
 *   onChangeText={setPassword}
 *   secureTextEntry
 *   leftIcon="lock-closed"
 * />
 * ```
 */
export function Input({
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
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine if we should show the password toggle
  const isPassword = secureTextEntry;
  const actualSecureTextEntry = isPassword && !showPassword;
  
  // Determine border color based on state - FIXED: Use Theme.colors.semantic.error
  const getBorderColor = () => {
    if (error) return Theme.colors.semantic.error;
    if (isFocused) return Theme.colors.primary[500];
    return Theme.colors.border.medium;
  };
  
  // Input container style
  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    height: Theme.dimensions.input.default,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: getBorderColor(),
    paddingHorizontal: Theme.spacing.m,
    opacity: disabled ? Theme.opacity.disabled : 1,
  };
  
  // Text input style
  const textInputStyle: TextStyle = {
    flex: 1,
    fontSize: Theme.typography.fontSize.body,
    lineHeight: Theme.typography.lineHeight.body,
    fontWeight: Theme.typography.fontWeight.regular,
    color: Theme.colors.text.primary,
    paddingVertical: 0, // Remove default padding
  };
  
  return (
    <View style={containerStyle} testID={testID}>
      {/* Label */}
      {label && (
        <Text
          variant="caption"
          color="secondary"
          weight="600"
          style={styles.label}
        >
          {label}
        </Text>
      )}
      
      {/* Input Container */}
      <View style={inputContainerStyle}>
        {/* Left Icon */}
        {leftIcon && (
          <Icon
            name={leftIcon}
            size="sm"
            color={isFocused ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
            accessibilityLabel={`${label} icon`}
          />
        )}
        
        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.text.tertiary}
          secureTextEntry={actualSecureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
      
      {/* Error Message - FIXED: Use Theme.colors.semantic.error */}
      {error && (
        <Text
          variant="caption"
          customColor={Theme.colors.semantic.error}
          style={styles.helperText}
        >
          {error}
        </Text>
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

const styles = StyleSheet.create({
  label: {
    marginBottom: Theme.spacing.xxs,
  },
  helperText: {
    marginTop: Theme.spacing.xxs,
    marginLeft: Theme.spacing.xs,
  },
});
