/**
 * VisionFlow AI - Pattern Overlay Controls (v1.1 - Fixed Haptics)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Theme } from '../../constants/theme';
import { Text, Pressable, Icon } from '../index';

type BlendModeType = 'normal' | 'screen' | 'multiply' | 'overlay' | 'lighten';

interface PatternOverlayControlsProps {
  opacity: number;
  onOpacityChange: (value: number) => void;
  blendMode: BlendModeType;
  onBlendModeChange: (mode: BlendModeType) => void;
  showEdges: boolean;
  onToggleEdges: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
}

const BLEND_MODES: Array<{ label: string; value: BlendModeType }> = [
  { label: 'Normal', value: 'normal' },
  { label: 'Screen', value: 'screen' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Add', value: 'lighten' },
];

export function PatternOverlayControls({
  opacity,
  onOpacityChange,
  blendMode,
  onBlendModeChange,
  showEdges,
  onToggleEdges,
  showLabels,
  onToggleLabels,
}: PatternOverlayControlsProps) {
  return (
    <View style={styles.container}>
      {/* Opacity Control */}
      <View style={styles.controlSection}>
        <View style={styles.controlHeader}>
          <Icon name="layers-outline" size="sm" color={Theme.colors.text.secondary} />
          <Text variant="caption" color="secondary" weight="700" style={styles.controlLabel}>
            OVERLAY OPACITY
          </Text>
          <Text variant="micro" customColor={Theme.colors.primary[500]} weight="700">
            {Math.round(opacity * 100)}%
          </Text>
        </View>
        {/* 🔧 FIXED: Removed haptic from slider (fires too frequently) */}
        <Slider
          style={styles.slider}
          value={opacity}
          onValueChange={onOpacityChange}
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          minimumTrackTintColor={Theme.colors.primary[500]}
          maximumTrackTintColor={Theme.colors.border.default}
          thumbTintColor={Theme.colors.primary[500]}
        />
      </View>

      {/* Blend Mode Selector */}
      <View style={styles.controlSection}>
        <View style={styles.controlHeader}>
          <Icon name="color-palette-outline" size="sm" color={Theme.colors.text.secondary} />
          <Text variant="caption" color="secondary" weight="700" style={styles.controlLabel}>
            BLEND MODE
          </Text>
        </View>
        <View style={styles.blendModeGrid}>
          {BLEND_MODES.map((mode) => (
            <Pressable
              key={mode.value}
              onPress={() => onBlendModeChange(mode.value)}
              // 🔧 FIXED: Removed haptic (too many chips, causes excessive vibration)
            >
              <View
                style={[
                  styles.blendModeChip,
                  blendMode === mode.value && styles.blendModeChipActive,
                ]}
              >
                <Text
                  variant="micro"
                  weight="700"
                  customColor={
                    blendMode === mode.value
                      ? Theme.colors.primary[500]
                      : Theme.colors.text.tertiary
                  }
                >
                  {mode.label.toUpperCase()}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Toggle Controls */}
      <View style={styles.toggleRow}>
        {/* 🔧 FIXED: Keep haptic only for important toggles */}
        <Pressable onPress={onToggleEdges} haptic="light" style={styles.toggleButton}>
          <Icon
            name={showEdges ? 'eye' : 'eye-off'}
            size="sm"
            color={showEdges ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
          />
          <Text
            variant="caption"
            weight="600"
            customColor={
              showEdges ? Theme.colors.primary[500] : Theme.colors.text.tertiary
            }
          >
            {showEdges ? 'EDGES' : 'ORIGINAL'}
          </Text>
        </Pressable>

        <Pressable onPress={onToggleLabels} haptic="light" style={styles.toggleButton}>
          <Icon
            name={showLabels ? 'pricetag' : 'pricetag-outline'}
            size="sm"
            color={showLabels ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
          />
          <Text
            variant="caption"
            weight="600"
            customColor={
              showLabels ? Theme.colors.primary[500] : Theme.colors.text.tertiary
            }
          >
            LABELS
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.m,
  },
  controlSection: {
    gap: Theme.spacing.s,
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  controlLabel: {
    flex: 1,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  blendModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  blendModeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },
  blendModeChipActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
    borderColor: Theme.colors.primary[500],
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.xs,
    paddingVertical: 10,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },
});
