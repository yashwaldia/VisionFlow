/**
 * VisionFlow AI - Input Component (v2.0 HUD Upgrade)
 * Data entry fields with terminal aesthetics and focus glow
 * * @module components/Input
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
  
  // Determine border color based on state
  const getBorderColor = () => {
    if (error) return Theme.colors.semantic.error;
    if (isFocused) return Theme.colors.primary[500];
    return Theme.colors.border.default; // Thinner, subtler default border
  };
  
  // Input container style
  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    height: Theme.dimensions.input.default,
    backgroundColor: Theme.colors.background.tertiary, // Darker data field
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: getBorderColor(),
    paddingHorizontal: Theme.spacing.m,
    opacity: disabled ? Theme.opacity.disabled : 1,
    // Apply Glow only when focused
    ...(isFocused ? Theme.shadows.glow : {}),
  };
  
  // Text input style - NOW MONOSPACE
  const textInputStyle: TextStyle = {
    flex: 1,
    fontSize: Theme.typography.fontSize.body,
    // Use Monospace for that "Terminal" feel
    fontFamily: Theme.typography.fontFamily.mono, 
    lineHeight: Theme.typography.lineHeight.body,
    color: Theme.colors.text.primary,
    paddingVertical: 0,
  };
  
  return (
    <View style={containerStyle} testID={testID}>
      {/* Label - Uppercase & Spaced */}
      {label && (
        <Text
          variant="caption"
          color="secondary"
          weight="700"
          style={[styles.label, { 
            textTransform: 'uppercase', 
            letterSpacing: 0.5 
          }]}
        >
          {label}
        </Text>
      )}
      
      {/* Input Container */}
      <View style={inputContainerStyle}>
        {/* Left Icon (Prompt) */}
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
          selectionColor={Theme.colors.primary[500]} // Electric Blue Cursor
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
          <Icon name="alert-circle-outline" size="xs" color={Theme.colors.semantic.error} />
          <Text
            variant="caption"
            customColor={Theme.colors.semantic.error}
            style={{ marginLeft: 4 }}
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

const styles = StyleSheet.create({
  label: {
    marginBottom: 6, // Slightly tighter
    fontSize: 11, // Smaller tactical label
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
});