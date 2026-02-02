/**
 * VisionFlow AI - Toast Component
 * Toast notification system with auto-dismiss
 * 
 * @module components/Toast
 */

import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Theme } from '../constants/theme';
import { Text } from './Text';
import { Icon, IconProps } from './Icon';

/**
 * Toast type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast position
 */
export type ToastPosition = 'top' | 'bottom';

/**
 * Toast props
 */
export interface ToastProps {
  /**
   * Toast type
   */
  type: ToastType;
  
  /**
   * Message text
   */
  message: string;
  
  /**
   * Toast visibility
   */
  visible: boolean;
  
  /**
   * Position on screen
   */
  position?: ToastPosition;
  
  /**
   * Auto dismiss duration (ms), 0 to disable
   */
  duration?: number;
  
  /**
   * Dismiss handler
   */
  onDismiss: () => void;
  
  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Get toast config based on type
 */
function getToastConfig(type: ToastType): {
  backgroundColor: string;
  iconName: IconProps['name'];
  iconColor: string;
} {
  switch (type) {
    case 'success':
      return {
        backgroundColor: Theme.colors.semantic.success,
        iconName: 'checkmark-circle',
        iconColor: '#FFFFFF',
      };
      
    case 'error':
      return {
        backgroundColor: Theme.colors.semantic.error,
        iconName: 'close-circle',
        iconColor: '#FFFFFF',
      };
      
    case 'warning':
      return {
        backgroundColor: Theme.colors.semantic.warning,
        iconName: 'warning',
        iconColor: '#000000',
      };
      
    case 'info':
      return {
        backgroundColor: Theme.colors.semantic.info,
        iconName: 'information-circle',
        iconColor: '#FFFFFF',
      };
      
    default:
      return {
        backgroundColor: Theme.colors.semantic.info,
        iconName: 'information-circle',
        iconColor: '#FFFFFF',
      };
  }
}

/**
 * Toast Component
 * 
 * @example
 * ```tsx
 * const [showToast, setShowToast] = useState(false);
 * 
 * <Toast
 *   type="success"
 *   message="Reminder saved successfully!"
 *   visible={showToast}
 *   onDismiss={() => setShowToast(false)}
 * />
 * 
 * <Toast
 *   type="error"
 *   message="Failed to process image"
 *   visible={showError}
 *   position="bottom"
 *   duration={5000}
 *   onDismiss={() => setShowError(false)}
 * />
 * ```
 */
export function Toast({
  type,
  message,
  visible,
  position = 'top',
  duration = 3000,
  onDismiss,
  testID,
}: ToastProps) {
  const translateY = useSharedValue(position === 'top' ? -100 : 100);
  const opacity = useSharedValue(0);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const config = getToastConfig(type);
  
  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      // Show animation
      opacity.value = withTiming(1, { duration: Theme.animation.duration.fast });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      
      // Auto dismiss
      if (duration > 0) {
        dismissTimeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    } else {
      // Hide animation
      opacity.value = withTiming(0, { duration: Theme.animation.duration.fast });
      translateY.value = withTiming(
        position === 'top' ? -100 : 100,
        { duration: Theme.animation.duration.fast }
      );
    }
    
    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [visible, duration, position, opacity, translateY]);
  
  // Handle dismiss
  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: Theme.animation.duration.fast });
    translateY.value = withTiming(
      position === 'top' ? -100 : 100,
      { duration: Theme.animation.duration.fast },
      () => {
        runOnJS(onDismiss)();
      }
    );
  };
  
  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });
  
  // Container style
  const containerStyle: ViewStyle = {
    backgroundColor: config.backgroundColor,
    ...styles.container,
    ...(position === 'top' ? styles.topPosition : styles.bottomPosition),
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <Animated.View
      style={[containerStyle, animatedStyle]}
      testID={testID}
    >
      <Icon
        name={config.iconName}
        size="sm"
        color={config.iconColor}
      />
      
      <Text
        variant="body"
        weight="600"
        customColor={config.iconColor}
        style={styles.message}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Theme.spacing.m,
    right: Theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderRadius: Theme.borderRadius.m,
    ...Theme.shadows.lg,
    zIndex: Theme.zIndex.toast,
  },
  topPosition: {
    top: Theme.spacing.xl,
  },
  bottomPosition: {
    bottom: Theme.spacing.xl,
  },
  message: {
    marginLeft: Theme.spacing.s,
    flex: 1,
  },
});
