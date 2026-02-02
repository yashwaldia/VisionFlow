/**
 * VisionFlow AI - SearchBar Component
 * Search input with icon and clear functionality
 * 
 * @module components/SearchBar
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Input } from './Input';

/**
 * SearchBar props
 */
export interface SearchBarProps {
  /**
   * Search query value
   */
  value: string;
  
  /**
   * Change handler
   */
  onChangeText: (text: string) => void;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Submit handler (when user presses return)
   */
  onSubmit?: () => void;
  
  /**
   * Clear handler
   */
  onClear?: () => void;
  
  /**
   * Auto focus on mount
   */
  autoFocus?: boolean;
  
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
 * SearchBar Component
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Search reminders..."
 *   onSubmit={handleSearch}
 * />
 * ```
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  onClear,
  autoFocus = false,
  style,
  testID,
}: SearchBarProps) {
  // Handle clear
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };
  
  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      leftIcon="search"
      rightIcon={value.length > 0 ? 'close-circle' : undefined}
      onRightIconPress={value.length > 0 ? handleClear : undefined}
      returnKeyType="search"
      onSubmitEditing={onSubmit}
      autoFocus={autoFocus}
      autoCorrect={false}
      containerStyle={style}
      testID={testID}
    />
  );
}
