/**
 * VisionFlow AI - Pressable Component
 * Enhanced touchable with haptics and animations
 * 
 * @module components/Pressable
 */


import React, { useCallback } from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';
import * as StorageService from '../services/storage.service';


/**
 * Haptic feedback type
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'none';


/**
 * Pressable component props
 */
export interface PressableProps extends Omit<RNPressableProps, 'style'> {
  /**
   * Pressable content
   */
  children: React.ReactNode;
  
  /**
   * Enable scale animation on press
   */
  scaleOnPress?: boolean;
  
  /**
   * Scale factor when pressed (default: 0.98)
   */
  pressScale?: number;
  
  /**
   * Enable opacity animation on press
   */
  opacityOnPress?: boolean;
  
  /**
   * Opacity when pressed (default: 0.7)
   */
  pressOpacity?: number;
  
  /**
   * Haptic feedback type
   */
  haptic?: HapticType;
  
  /**
   * Style for the pressable
   */
  style?: ViewStyle | ViewStyle[];
  
  /**
   * Disabled state
   */
  disabled?: boolean;
}


/**
 * Trigger haptic feedback
 */
async function triggerHaptic(type: HapticType) {
  if (type === 'none' || Platform.OS === 'web') return;
  
  // Check user preference
  try {
    const userPrefs = await StorageService.getUserPreferences();
    if (!userPrefs.display.hapticFeedbackEnabled) {
      return; // User has disabled haptics
    }
  } catch (error) {
    console.error('[Pressable] Failed to check haptic preference:', error);
    // Continue with haptic on error to maintain expected behavior
  }
  
  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
  }
}


/**
 * Enhanced Pressable Component
 * 
 * @example
 * ```tsx
 * <Pressable scaleOnPress haptic="light" onPress={() => console.log('Pressed')}>
 *   <Text>Press Me</Text>
 * </Pressable>
 * ```
 */
export function Pressable({
  children,
  scaleOnPress = false,
  pressScale = 0.98,
  opacityOnPress = false,
  pressOpacity = 0.7,
  haptic = 'none',
  style,
  disabled = false,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: PressableProps) {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Handle press in
  const handlePressIn = useCallback(
    (event: any) => {
      if (scaleOnPress) {
        scale.value = withSpring(pressScale, {
          damping: 15,
          stiffness: 150,
        });
      }
      
      if (opacityOnPress) {
        opacity.value = withTiming(pressOpacity, {
          duration: Theme.animation.duration.fast,
        });
      }
      
      // Trigger haptic (async, fire and forget)
      if (haptic !== 'none') {
        triggerHaptic(haptic).catch(err => 
          console.error('[Pressable] Haptic trigger failed:', err)
        );
      }
      
      onPressIn?.(event);
    },
    [scaleOnPress, pressScale, opacityOnPress, pressOpacity, haptic, onPressIn, scale, opacity]
  );
  
  // Handle press out
  const handlePressOut = useCallback(
    (event: any) => {
      if (scaleOnPress) {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
      }
      
      if (opacityOnPress) {
        opacity.value = withTiming(1, {
          duration: Theme.animation.duration.fast,
        });
      }
      
      onPressOut?.(event);
    },
    [scaleOnPress, opacityOnPress, onPressOut, scale, opacity]
  );
  
  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  // Disabled style
  const disabledStyle: ViewStyle = disabled
    ? {
        opacity: Theme.opacity.disabled,
        pointerEvents: 'none',
      }
    : {};
  
  return (
    <RNPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle, disabledStyle]}>
        {children}
      </Animated.View>
    </RNPressable>
  );
}
