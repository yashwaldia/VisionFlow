/**
 * VisionFlow AI - LoadingSpinner Component (v2.0 - Circular Animation Edition)
 * Concentric circles loading animation matching Hidden Inside web prototype
 * 
 * @module components/LoadingSpinner
 * 
 * CHANGELOG v2.0:
 * - ✅ Complete redesign: Circular concentric rings animation
 * - ✅ Blue glow effect matching web prototype
 * - ✅ Technical loading text (uppercase, monospace)
 * - ✅ Animated rotation with Reanimated
 */

import React, { useEffect } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Theme } from '../constants/theme';
import { Text } from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type SpinnerSize = 'small' | 'large';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  text?: string;
  centered?: boolean;
  fullScreen?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * LoadingSpinner Component
 * Circular concentric rings with rotation animation
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="large" text="PROCESSING..." />
 * <LoadingSpinner fullScreen text="DECRYPTING GEOMETRIC KERNEL..." />
 * ```
 */
export function LoadingSpinner({
  size = 'large',
  color = Theme.colors.primary[500],
  text,
  centered = true,
  fullScreen = false,
  style,
  testID,
}: LoadingSpinnerProps) {
  
  // Dimensions based on size
  const dimensions = size === 'large' ? { radius: 50, strokeWidth: 2 } : { radius: 30, strokeWidth: 1.5 };
  const { radius, strokeWidth } = dimensions;
  const viewBox = radius * 2 + 20;
  const center = viewBox / 2;
  
  // Animation values
  const rotation = useSharedValue(0);
  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);
  const pulse3 = useSharedValue(1);
  
  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    
    // Pulse animations (staggered)
    pulse1.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
    
    pulse2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1.15, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
    
    pulse3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(1.08, { duration: 800 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      false
    );
  }, []);
  
  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  // Animated circle props
  const circle1Props = useAnimatedProps(() => ({
    opacity: 0.3 * pulse1.value,
    strokeWidth: strokeWidth * pulse1.value,
  }));
  
  const circle2Props = useAnimatedProps(() => ({
    opacity: 0.5 * pulse2.value,
    strokeWidth: strokeWidth * pulse2.value,
  }));
  
  const circle3Props = useAnimatedProps(() => ({
    opacity: 0.7 * pulse3.value,
    strokeWidth: strokeWidth * pulse3.value,
  }));
  
  // Container style
  const getContainerStyle = (): ViewStyle => {
    if (fullScreen) {
      return styles.fullScreenContainer;
    }
    if (centered) {
      return styles.centeredContainer;
    }
    return styles.defaultContainer;
  };
  
  const containerStyle = getContainerStyle();
  const containerStyles: ViewStyle[] = [containerStyle];
  if (style) {
    containerStyles.push(style);
  }
  
  return (
    <View style={containerStyles} testID={testID}>
      <Animated.View style={[styles.spinnerContainer, rotationStyle]}>
        <Svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`}>
          {/* Outer ring */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            fill="none"
            strokeDasharray="10 5"
            animatedProps={circle1Props}
          />
          
          {/* Middle ring */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius * 0.7}
            stroke={color}
            fill="none"
            strokeDasharray="8 4"
            animatedProps={circle2Props}
          />
          
          {/* Inner ring */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius * 0.4}
            stroke={color}
            fill="none"
            strokeDasharray="6 3"
            animatedProps={circle3Props}
          />
          
          {/* Center dot */}
          <Circle
            cx={center}
            cy={center}
            r={4}
            fill={color}
            opacity={0.8}
          />
        </Svg>
      </Animated.View>
      
      {text && (
        <Text
          variant="caption"
          color="secondary"
          align="center"
          mono
          weight="700"
          style={styles.text}
        >
          {text.toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.overlay,
    zIndex: Theme.zIndex.modal,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: Theme.spacing.l,
    letterSpacing: 2,
  },
});
