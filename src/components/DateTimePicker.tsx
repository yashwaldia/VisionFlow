/**
 * VisionFlow AI - DateTimePicker Component
 * Native date and time picker wrapper
 * 
 * @module components/DateTimePicker
 */

import React, { useState } from 'react';
import { View, ViewStyle, Platform, Modal, StyleSheet } from 'react-native';
import DateTimePickerNative, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Theme } from '../constants/theme';
import { Text } from './Text';
import { Button } from './Button';
import { Pressable } from './Pressable';
import { formatDate, formatTime24 } from '../utils/dateUtils';

/**
 * DateTimePicker mode
 */
export type DateTimePickerMode = 'date' | 'time' | 'datetime';

/**
 * DateTimePicker props
 */
export interface DateTimePickerProps {
  /**
   * Picker mode
   */
  mode: DateTimePickerMode;
  
  /**
   * Current value (Date object)
   */
  value: Date;
  
  /**
   * Change handler
   */
  onChange: (date: Date) => void;
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Minimum date
   */
  minimumDate?: Date;
  
  /**
   * Maximum date
   */
  maximumDate?: Date;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Container style
   */
  style?: ViewStyle;
  
  /**
   * Test ID
   */
  testID?: string;
}

/**
 * DateTimePicker Component
 * 
 * @example
 * ```tsx
 * <DateTimePicker
 *   mode="date"
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   label="Select Date"
 * />
 * 
 * <DateTimePicker
 *   mode="time"
 *   value={selectedTime}
 *   onChange={setSelectedTime}
 *   label="Select Time"
 * />
 * ```
 */
export function DateTimePicker({
  mode,
  value,
  onChange,
  label,
  minimumDate,
  maximumDate,
  disabled = false,
  style,
  testID,
}: DateTimePickerProps) {
  const [show, setShow] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  
  // Format display value based on mode
  const getDisplayValue = () => {
    switch (mode) {
      case 'date':
        return formatDate(value, 'long');
      case 'time':
        return formatTime24(value.getHours(), value.getMinutes());
      case 'datetime':
        return formatDate(value, 'datetime');
      default:
        return formatDate(value, 'medium');
    }
  };
  
  // Handle picker change (Android) - FIXED: Added proper types
  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      setTempValue(selectedDate);
      
      if (Platform.OS === 'android') {
        onChange(selectedDate);
      }
    }
  };
  
  // Handle confirm (iOS)
  const handleConfirm = () => {
    onChange(tempValue);
    setShow(false);
  };
  
  // Handle cancel (iOS)
  const handleCancel = () => {
    setTempValue(value);
    setShow(false);
  };
  
  // Android native picker
  if (Platform.OS === 'android') {
    return (
      <View style={style} testID={testID}>
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
        
        <Pressable
          onPress={() => !disabled && setShow(true)}
          disabled={disabled}
          haptic="light"
        >
          <View style={styles.inputContainer}>
            <Text variant="body" color={disabled ? 'disabled' : 'primary'}>
              {getDisplayValue()}
            </Text>
          </View>
        </Pressable>
        
        {show && (
          <DateTimePickerNative
            value={tempValue}
            mode={mode === 'datetime' ? 'date' : mode}
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            textColor={Theme.colors.text.primary}
          />
        )}
      </View>
    );
  }
  
  // iOS modal picker
  return (
    <View style={style} testID={testID}>
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
      
      <Pressable
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
        haptic="light"
      >
        <View style={styles.inputContainer}>
          <Text variant="body" color={disabled ? 'disabled' : 'primary'}>
            {getDisplayValue()}
          </Text>
        </View>
      </Pressable>
      
      <Modal
        visible={show}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Button
                label="Cancel"
                variant="ghost"
                size="small"
                onPress={handleCancel}
              />
              <Text variant="h4">{label || 'Select'}</Text>
              <Button
                label="Done"
                variant="ghost"
                size="small"
                onPress={handleConfirm}
              />
            </View>
            
            <DateTimePickerNative
              value={tempValue}
              mode={mode === 'datetime' ? 'date' : mode}
              display="spinner"
              onChange={(event: DateTimePickerEvent, date?: Date) => date && setTempValue(date)} // FIXED: Added explicit types
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              textColor={Theme.colors.text.primary}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Theme.spacing.xxs,
  },
  inputContainer: {
    height: Theme.dimensions.input.default, // FIXED: Use default instead of medium
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: Theme.colors.border.medium,
    paddingHorizontal: Theme.spacing.m,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.background.secondary,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    paddingBottom: Theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },
});
