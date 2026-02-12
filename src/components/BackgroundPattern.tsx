/**
 * VisionFlow AI - BackgroundPattern Component
 * Tactical grid/scanline overlay for cyberpunk HUD aesthetic
 * Matches Hidden Inside web prototype
 * 
 * @module components/BackgroundPattern
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Theme } from '../constants/theme';

interface BackgroundPatternProps {
  /**
   * Pattern intensity (0-1)
   * @default 0.03
   */
  intensity?: number;
  
  /**
   * Show animated scanline overlay
   * @default true
   */
  animated?: boolean;
  
  /**
   * Grid cell size
   * @default 40
   */
  gridSize?: number;
}

/**
 * BackgroundPattern Component
 * Creates the subtle grid/scanline effect from the web prototype
 * 
 * Features:
 * - Vertical grid lines (subtle)
 * - Horizontal grid lines (very subtle)
 * - Animated scanline sweep
 * - Blue accent glow
 */
export function BackgroundPattern({
  intensity = 0.03,
  animated = true,
  gridSize = 40,
}: BackgroundPatternProps) {
  
  // Animated scanline position
  const scanlinePosition = useSharedValue(0);
  
  useEffect(() => {
    if (animated) {
      // Infinite sweep from top to bottom
      scanlinePosition.value = withRepeat(
        withTiming(1, {
          duration: 8000,
          easing: Easing.linear,
        }),
        -1, // Infinite
        false // Don't reverse
      );
    }
  }, [animated]);
  
  const scanlineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scanlinePosition.value * 1000, // Adjust based on screen height
        },
      ],
    };
  });
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Static Grid Pattern */}
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          {/* Blue gradient for grid lines */}
          <LinearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Theme.colors.primary[500]} stopOpacity="0" />
            <Stop offset="0.5" stopColor={Theme.colors.primary[500]} stopOpacity={intensity * 2} />
            <Stop offset="1" stopColor={Theme.colors.primary[500]} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        
        {/* Vertical grid lines (every gridSize px) */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Line
            key={`v-${i}`}
            x1={i * gridSize}
            y1="0"
            x2={i * gridSize}
            y2="100%"
            stroke={`rgba(255, 255, 255, ${intensity})`}
            strokeWidth="0.5"
          />
        ))}
        
        {/* Horizontal grid lines (less visible) */}
        {Array.from({ length: 30 }).map((_, i) => (
          <Line
            key={`h-${i}`}
            x1="0"
            y1={i * gridSize}
            x2="100%"
            y2={i * gridSize}
            stroke={`rgba(255, 255, 255, ${intensity * 0.5})`}
            strokeWidth="0.3"
          />
        ))}
      </Svg>
      
      {/* Animated Scanline */}
      {animated && (
        <Animated.View style={[styles.scanline, scanlineStyle]}>
          <View style={styles.scanlineGlow} />
        </Animated.View>
      )}
      
      {/* Subtle noise texture overlay */}
      <View style={styles.noiseOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  scanline: {
    position: 'absolute',
    width: '100%',
    height: 2,
    top: -100, // Start above screen
  },
  scanlineGlow: {
    width: '100%',
    height: 40,
    backgroundColor: Theme.colors.primary[500],
    opacity: 0.05,
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.02,
  },
});
