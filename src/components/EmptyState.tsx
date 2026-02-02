/**
 * VisionFlow AI - EmptyState Component
 * Empty state placeholder for lists and screens
 * 
 * @module components/EmptyState
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Text } from './Text';
import { Icon, IconProps } from './Icon';
import { Button, ButtonProps } from './Button';

/**
 * EmptyState props
 */
export interface EmptyStateProps {
  /**
   * Icon name
   */
  icon: IconProps['name'];
  
  /**
   * Icon color
   */
  iconColor?: string;
  
  /**
   * Title text
   */
  title: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Action button label
   */
  actionLabel?: string;
  
  /**
   * Action button press handler
   */
  onActionPress?: () => void;
  
  /**
   * Action button variant
   */
  actionVariant?: ButtonProps['variant'];
  
  /**
   * Custom container style
   */
  style?: ViewStyle;
  
  /**
   * Test ID
   */
  testID?: string;
}

/**
 * EmptyState Component
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon="calendar-outline"
 *   title="No reminders yet"
 *   description="Capture your first image to create a reminder"
 *   actionLabel="Open Camera"
 *   onActionPress={handleOpenCamera}
 * />
 * 
 * <EmptyState
 *   icon="search"
 *   title="No results found"
 *   description="Try adjusting your search"
 * />
 * ```
 */
export function EmptyState({
  icon,
  iconColor = Theme.colors.text.tertiary,
  title,
  description,
  actionLabel,
  onActionPress,
  actionVariant = 'primary',
  style,
  testID,
}: EmptyStateProps) {
  // Combine styles
  const containerStyles: ViewStyle[] = [styles.container];
  if (style) {
    containerStyles.push(style);
  }
  
  return (
    <View style={containerStyles} testID={testID}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Icon
          name={icon}
          customSize={64}
          color={iconColor}
          accessibilityLabel={title}
        />
      </View>
      
      {/* Title */}
      <Text
        variant="h3"
        color="primary"
        align="center"
        style={styles.title}
      >
        {title}
      </Text>
      
      {/* Description */}
      {description && (
        <Text
          variant="body"
          color="secondary"
          align="center"
          style={styles.description}
        >
          {description}
        </Text>
      )}
      
      {/* Action Button */}
      {actionLabel && onActionPress && (
        <Button
          label={actionLabel}
          variant={actionVariant}
          onPress={onActionPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: Theme.spacing.l,
    opacity: Theme.opacity.secondary,
  },
  title: {
    marginBottom: Theme.spacing.s,
  },
  description: {
    marginBottom: Theme.spacing.l,
    maxWidth: 280,
  },
  button: {
    marginTop: Theme.spacing.m,
  },
});
