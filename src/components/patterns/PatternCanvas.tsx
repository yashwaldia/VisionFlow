/**
 * VisionFlow AI - Pattern Canvas Component (v1.1 - Blend Mode Fix)
 * SVG rendering with blend mode support via wrapper View
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedProps,
  SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Pattern, PATTERN_COLORS } from '../../types/pattern.types';
import { usePatternRendering, anchorToPixels } from '../../hooks/usePatternRendering';
import { Theme } from '../../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = SCREEN_WIDTH * (3 / 4);

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface PatternCanvasProps {
  patterns: Pattern[];
  selectedPatternId: string | null;
  opacity: number;
  showLabels: boolean;
  blendMode?: string; // 🔧 NEW: Accept blend mode prop
  onPatternTap?: (patternId: string) => void;
}

export function PatternCanvas({
  patterns,
  selectedPatternId,
  opacity,
  showLabels,
  blendMode = 'screen', // 🔧 NEW: Default blend mode
  onPatternTap,
}: PatternCanvasProps) {
  const sonarProgress = useSharedValue(0);

  useEffect(() => {
    sonarProgress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // 🔧 FIXED: Apply both opacity AND blend mode to wrapper
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity,
  }));

  // 🔧 NEW: Map blend mode names to React Native values
  const getBlendModeStyle = () => {
    const blendModeMap: Record<string, any> = {
      normal: 'normal',
      screen: 'screen',
      multiply: 'multiply',
      overlay: 'overlay',
      lighten: 'lighten',
      darken: 'darken',
      // Add more if needed
    };

    return {
      // @ts-ignore - mixBlendMode is supported but not in types
      mixBlendMode: blendModeMap[blendMode] || 'screen',
    };
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        overlayAnimatedStyle,
        getBlendModeStyle(), // 🔧 NEW: Apply blend mode here
      ]} 
      pointerEvents="box-none"
    >
      <Svg width={SCREEN_WIDTH} height={IMAGE_HEIGHT} style={StyleSheet.absoluteFill}>
        <Defs>
          {patterns.map((pattern, idx) => {
            const color = PATTERN_COLORS[pattern.type] || Theme.colors.primary[500];
            return (
              <RadialGradient
                key={`gradient-${idx}`}
                id={`glow-${idx}`}
                cx="50%"
                cy="50%"
              >
                <Stop offset="0%" stopColor={color} stopOpacity="0.6" />
                <Stop offset="100%" stopColor={color} stopOpacity="0" />
              </RadialGradient>
            );
          })}
        </Defs>

        {patterns.map((pattern, patternIndex) => (
          <PatternLayer
            key={patternIndex}
            pattern={pattern}
            patternIndex={patternIndex}
            isSelected={selectedPatternId === `pattern-${patternIndex}`}
            hasSelection={selectedPatternId !== null}
            sonarProgress={sonarProgress}
            showLabels={showLabels}
            onTap={onPatternTap}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

interface PatternLayerProps {
  pattern: Pattern;
  patternIndex: number;
  isSelected: boolean;
  hasSelection: boolean;
  sonarProgress: SharedValue<number>;
  showLabels: boolean;
  onTap?: (patternId: string) => void;
}

function PatternLayer({
  pattern,
  patternIndex,
  isSelected,
  hasSelection,
  sonarProgress,
  showLabels,
  onTap,
}: PatternLayerProps) {
  const { path, dashArray, fillOpacity } = usePatternRendering(pattern);
  const patternColor = PATTERN_COLORS[pattern.type] || Theme.colors.primary[500];
  
  const currentOpacity = isSelected ? 1.0 : hasSelection ? 0.15 : 0.8;
  const depthFactor = (patternIndex + 1) / Math.max(1, patternIndex);
  const strokeWidth = isSelected ? 4 : 2 + depthFactor * 1.5;

  const dashOffset = useSharedValue(0);

  useEffect(() => {
    if (dashArray) {
      dashOffset.value = withRepeat(
        withTiming(-20, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [dashArray]);

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: dashArray ? dashOffset.value : 0,
  }));

  return (
    <G opacity={currentOpacity} onPress={() => onTap?.(`pattern-${patternIndex}`)}>
      {path && (
        <AnimatedPath
          d={path}
          stroke={patternColor}
          strokeWidth={strokeWidth}
          fill={fillOpacity > 0 ? `${patternColor}${Math.round(fillOpacity * 255).toString(16).padStart(2, '0')}` : 'none'}
          strokeDasharray={dashArray}
          animatedProps={animatedPathProps}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {pattern.anchors.map((anchor, anchorIndex) => (
        <AnchorPoint
          key={anchorIndex}
          anchor={anchor}
          color={patternColor}
          isSelected={isSelected}
          sonarProgress={sonarProgress}
          showLabel={showLabels && anchorIndex === 0}
          label={`P${patternIndex + 1}`}
        />
      ))}
    </G>
  );
}

interface AnchorPointProps {
  anchor: { x: number; y: number };
  color: string;
  isSelected: boolean;
  sonarProgress: SharedValue<number>;
  showLabel: boolean;
  label: string;
}

function AnchorPoint({
  anchor,
  color,
  isSelected,
  sonarProgress,
  showLabel,
  label,
}: AnchorPointProps) {
  const pos = anchorToPixels(anchor.x, anchor.y);
  const baseSize = isSelected ? 12 : 8;

  return (
    <G>
      {/* Sonar Pulse Rings */}
      {[0, 0.33, 0.66].map((offset, i) => {
        const progress = (sonarProgress.value + offset) % 1;
        const radius = 5 + progress * 30;
        const opacity = (1 - progress) * 0.4;

        return (
          <Circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={radius}
            stroke={color}
            strokeWidth={2}
            fill="none"
            opacity={isSelected ? opacity : opacity * 0.3}
          />
        );
      })}

      {isSelected && (
        <Circle
          cx={pos.x}
          cy={pos.y}
          r={baseSize + 8}
          fill={`url(#glow-0)`}
        />
      )}

      <Circle
        cx={pos.x}
        cy={pos.y}
        r={baseSize}
        fill={color}
        stroke={Theme.colors.background.primary}
        strokeWidth={2}
      />

      {showLabel && (
        <SvgText
          x={pos.x}
          y={pos.y - baseSize - 12}
          fill={color}
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          {label}
        </SvgText>
      )}
    </G>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
});
