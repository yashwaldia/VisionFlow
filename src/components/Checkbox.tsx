/**
 * VisionFlow AI - Checkbox Component
 * Checkbox with toggle support
 * 
 * @module components/Checkbox
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Text } from './Text';
import { Icon } from './Icon';
import { Pressable } from './Pressable';

/**
 * Checkbox props
 */
export interface CheckboxProps {
  /**
   * Checked state
   */
  checked: boolean;
  
  /**
   * Change handler
   */
  onCheckedChange: (checked: boolean) => void;
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
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
 * Checkbox Component
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   checked={isCompleted}
 *   onCheckedChange={setIsCompleted}
 *   label="Mark as completed"
 * />
 * ```
 */
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  style,
  testID,
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };
  
  // Checkbox box style
  const boxStyle: ViewStyle = {
    width: 24,
    height: 24,
    borderRadius: Theme.borderRadius.s,
    borderWidth: 2,
    borderColor: checked ? Theme.colors.primary[500] : Theme.colors.border.medium,
    backgroundColor: checked ? Theme.colors.primary[500] : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  // Combine styles - FIXED: Proper handling of optional style prop
  const containerStyles: ViewStyle[] = [styles.container];
  if (style) {
    containerStyles.push(style);
  }
  
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      haptic="light"
      style={containerStyles}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      testID={testID}
    >
      <View style={boxStyle}>
        {checked && (
          <Icon
            name="checkmark"
            size="sm"
            color={Theme.colors.text.primary}
          />
        )}
      </View>
      
      {label && (
        <Text
          variant="body"
          color={disabled ? 'disabled' : 'primary'}
          style={styles.label}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: Theme.spacing.s,
  },
});
